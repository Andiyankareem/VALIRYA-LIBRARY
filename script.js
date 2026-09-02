// Cart management
let cart = [];

// DOM Elements
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const modalOverlay = document.getElementById('modal-overlay');
const checkoutModal = document.getElementById('checkout-modal');
const closeModal = document.getElementById('close-modal');
const checkoutForm = document.getElementById('checkout-form');
const orderSummary = document.getElementById('order-summary');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Product data from HTML elements
function getProductData(productId) {
    const productCard = document.querySelector(`.product-card .add-to-cart-btn[data-id="${productId}"]`).closest('.product-card');

    return {
        id: parseInt(productId),
        title: productCard.querySelector('.product-title').textContent,
        author: productCard.querySelector('.product-author').textContent,
        price: parseFloat(productCard.querySelector('.product-price').textContent.replace('$', '')),
        image: productCard.querySelector('.product-image img').src
    };
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Load cart from localStorage if it exists
    const savedCart = localStorage.getItem('stationeryCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }

    // Event listeners
    cartBtn.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartDrawer);
    cartOverlay.addEventListener('click', closeCartDrawer);
    checkoutBtn.addEventListener('click', openCheckoutModal);
    closeModal.addEventListener('click', closeCheckoutModal);
    modalOverlay.addEventListener('click', closeCheckoutModal);
    checkoutForm.addEventListener('submit', handleCheckout);

    // Add event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            addToCart(productId);
        });
    });
});

// Add a product to the cart
function addToCart(productId) {
    const product = getProductData(productId);

    if (!product) return;

    // Check if the product is already in the cart
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        // If it exists, increase the quantity
        existingItem.quantity++;
        showToast(`${product.title} quantity updated!`);
    } else {
        // If it doesn't exist, add it to the cart
        cart.push({
            id: product.id,
            title: product.title,
            author: product.author,
            price: product.price,
            quantity: 1,
            image: product.image
        });
        showToast(`${product.title} added to cart!`);
    }

    // Update cart UI and save to localStorage
    updateCartUI();
    saveCartToLocalStorage();
}

// Remove an item from the cart
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex !== -1) {
        const itemTitle = cart[itemIndex].title;
        cart.splice(itemIndex, 1);
        updateCartUI();
        saveCartToLocalStorage();
        showToast(`${itemTitle} removed from cart!`);
    }
}

// Update item quantity in the cart
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity = newQuantity;
        updateCartUI();
        saveCartToLocalStorage();
    }
}

// Update cart UI elements
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items display
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
    } else {
        cartItems.innerHTML = '';

        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-author">by ${item.author}</p>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-quantity" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase-quantity" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            cartItems.appendChild(cartItemElement);
        });

        // Add event listeners to quantity controls and remove buttons
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', () => {
                const productId = parseInt(button.getAttribute('data-id'));
                updateQuantity(productId, cart.find(item => item.id === productId).quantity - 1);
            });
        });

        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', () => {
                const productId = parseInt(button.getAttribute('data-id'));
                updateQuantity(productId, cart.find(item => item.id === productId).quantity + 1);
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = parseInt(button.getAttribute('data-id'));
                removeFromCart(productId);
            });
        });
    }

    // Update cart total
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${subtotal.toFixed(2)}`;
}

// Save cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('stationeryCart', JSON.stringify(cart));
}

// Open cart drawer
function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close cart drawer
function closeCartDrawer() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Open checkout modal
function openCheckoutModal() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }

    // Generate order summary
    generateOrderSummary();

    // Show modal
    modalOverlay.classList.add('active');
    checkoutModal.style.opacity = '1';
    checkoutModal.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
}

// Close checkout modal
function closeCheckoutModal() {
    modalOverlay.classList.remove('active');
    checkoutModal.style.opacity = '0';
    checkoutModal.style.visibility = 'hidden';
    document.body.style.overflow = '';

    // Reset form
    checkoutForm.reset();
}

// Generate order summary for checkout
function generateOrderSummary() {
    orderSummary.innerHTML = '';

    // Add order items
    const orderItemsTitle = document.createElement('h4');
    orderItemsTitle.className = 'order-summary-title';
    orderItemsTitle.textContent = 'Order Summary';
    orderSummary.appendChild(orderItemsTitle);

    cart.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <span>${item.title} (x${item.quantity})</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        orderSummary.appendChild(orderItem);
    });

    // Add order total
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderTotal = document.createElement('div');
    orderTotal.className = 'order-total';
    orderTotal.innerHTML = `
        <span>Total:</span>
        <span>$${subtotal.toFixed(2)}</span>
    `;
    orderSummary.appendChild(orderTotal);
}

// Handle checkout form submission
function handleCheckout(e) {
    e.preventDefault();

    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const customerEmail = document.getElementById('customer-email').value;

    // Generate WhatsApp message
    const orderDate = new Date().toLocaleDateString();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let message = `Hello, my name is ${customerName}. I would like to place the following order:

`;

    cart.forEach(item => {
        message += `- ${item.title} by ${item.author} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}
`;
    });

    message += `
Total: IQD${subtotal.toFixed(2)}
Date: ${orderDate}
`;

    if (customerPhone) {
        message += `
Phone: ${customerPhone}`;
    }

    if (customerEmail) {
        message += `
Email: ${customerEmail}`;
    }

    // URL encode the message
    const encodedMessage = encodeURIComponent(message);

    // Open WhatsApp in a new tab
    window.open(`https://wa.me/+9647866247926?text=${encodedMessage}`, '_blank');

    // Close modal and clear cart
    closeCheckoutModal();
    cart = [];
    updateCartUI();
    saveCartToLocalStorage();

    showToast('Order sent via WhatsApp! Thank you for your purchase.');
}

// Show toast notification
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}
