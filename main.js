// WalkWay Website - Main JavaScript Functionality
// This file handles all interactive elements across the website

class WalkWayStore {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('walkway_cart')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('walkway_wishlist')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.updateWishlistCount();
        this.bindEvents();
        this.initSearch();
        checkLoginStatus();
    }

    // Cart Functionality
    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${product.name} added to cart!`, 'success');
    }

    removeFromCart(productId) {
        // Convert productId to number for proper comparison
        const numericId = parseFloat(productId);
        this.cart = this.cart.filter(item => parseFloat(item.id) !== numericId);
        this.saveCart();
        this.updateCartCount();
        this.showNotification('Item removed from cart', 'info');
    }

    saveCart() {
        localStorage.setItem('walkway_cart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartButtons = document.querySelectorAll('.cart-btn');
        cartButtons.forEach(btn => {
            const cartText = btn.querySelector('.cart-text') || btn;
            cartText.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                CART (${totalItems})
            `;
        });
    }

    // Wishlist Functionality
    addToWishlist(product) {
        const existingItem = this.wishlist.find(item => item.id === product.id);
        
        if (!existingItem) {
            this.wishlist.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image
            });
            this.saveWishlist();
            this.updateWishlistCount();
            this.showNotification(`${product.name} added to wishlist!`, 'success');
        } else {
            this.showNotification('Item already in wishlist', 'info');
        }
    }

    removeFromWishlist(productId) {
        // Convert productId to number for proper comparison
        const numericId = parseFloat(productId);
        this.wishlist = this.wishlist.filter(item => parseFloat(item.id) !== numericId);
        this.saveWishlist();
        this.updateWishlistCount();
        this.showNotification('Item removed from wishlist', 'info');
    }

    saveWishlist() {
        localStorage.setItem('walkway_wishlist', JSON.stringify(this.wishlist));
    }

    updateWishlistCount() {
        const wishlistButtons = document.querySelectorAll('.wishlist-btn');
        wishlistButtons.forEach(btn => {
            btn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                WISHLIST (${this.wishlist.length})
            `;
        });
    }

    // Search Functionality
    initSearch() {
        const searchInputs = document.querySelectorAll('.search-input');
        const searchButtons = document.querySelectorAll('.search-btn');

        searchInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(input.value);
                }
            });
        });

        searchButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.parentElement.querySelector('.search-input');
                this.performSearch(input.value);
            });
        });
    }

    performSearch(query) {
        if (!query.trim()) {
            this.showNotification('Please enter a search term', 'warning');
            return;
        }

        // Hide all products first
        const products = document.querySelectorAll('.product');
        let foundProducts = 0;

        products.forEach(product => {
            const productName = product.querySelector('h3')?.textContent.toLowerCase() || '';
            const productText = product.textContent.toLowerCase();
            
            if (productName.includes(query.toLowerCase()) || productText.includes(query.toLowerCase())) {
                product.style.display = 'flex';
                foundProducts++;
            } else {
                product.style.display = 'none';
            }
        });

        if (foundProducts === 0) {
            this.showNotification(`No products found for "${query}"`, 'info');
            // Show all products again
            products.forEach(product => {
                product.style.display = 'flex';
            });
        } else {
            this.showNotification(`Found ${foundProducts} product(s) for "${query}"`, 'success');
        }
    }

    // Event Binding
    bindEvents() {
        // Add to Cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('button') && e.target.textContent.includes('Add')) {
                e.preventDefault();
                const productElement = e.target.closest('.product');
                if (productElement) {
                    const product = this.extractProductData(productElement);
                    this.addToCart(product);
                }
            }

            // Cart button click
            if (e.target.closest('.cart-btn')) {
                e.preventDefault();
                this.showCart();
            }

            // Wishlist button click (header)
            if (e.target.closest('.wishlist-btn')) {
                e.preventDefault();
                this.showWishlist();
            }

            // Wishlist heart button click (product cards)
            if (e.target.closest('.wishlist-heart')) {
                e.preventDefault();
                const heartBtn = e.target.closest('.wishlist-heart');
                const productElement = heartBtn.closest('.product');
                if (productElement) {
                    const product = this.extractProductData(productElement);
                    this.addToWishlist(product);
                    // Add visual feedback
                    heartBtn.style.background = '#ff4757';
                    heartBtn.style.color = 'white';
                    heartBtn.querySelector('svg').style.fill = 'white';
                    setTimeout(() => {
                        heartBtn.style.background = 'rgba(255, 255, 255, 0.9)';
                        heartBtn.style.color = 'inherit';
                        heartBtn.querySelector('svg').style.fill = 'none';
                    }, 1000);
                }
            }
        });

        // Shop Now buttons
        const shopNowButtons = document.querySelectorAll('.btn, .shop-now-btn, .auth-btn');
        shopNowButtons.forEach(btn => {
            if (!btn.type || btn.type !== 'submit') {
                btn.addEventListener('click', (e) => {
                    if (btn.textContent.includes('Shop Now')) {
                        e.preventDefault();
                        this.scrollToProducts();
                    }
                });
            }
        });
    }

    extractProductData(productElement) {
        const id = Date.now() + Math.random(); // Simple ID generation
        const name = productElement.querySelector('h3')?.textContent || 'Unknown Product';
        const priceElement = productElement.querySelector('.price');
        
        // Extract only the actual price (first number), not MRP
        let price = 0;
        if (priceElement) {
            const priceText = priceElement.textContent;
            const priceMatch = priceText.match(/₹([\d,]+)/);
            if (priceMatch) {
                price = parseFloat(priceMatch[1].replace(/,/g, ''));
            }
        }
        
        const image = productElement.querySelector('img')?.src || '';

        return { id, name, price, image };
    }

    scrollToProducts() {
        const productsSection = document.querySelector('.products, .best-seller, .footwear');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            this.showNotification('Browse our collection above!', 'info');
        }
    }

    // Cart Modal
    showCart() {
        const cartModal = this.createCartModal();
        document.body.appendChild(cartModal);
    }

    createCartModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const cartContent = document.createElement('div');
        cartContent.className = 'cart-modal';
        cartContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;

        let cartHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #333; margin: 0;">Shopping Cart</h2>
                <button class="close-modal" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
        `;

        if (this.cart.length === 0) {
            cartHTML += `
                <p style="text-align: center; color: #666; margin: 40px 0;">Your cart is empty</p>
                <div style="text-align: center;">
                    <button class="close-modal" style="background: #f39c12; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">Continue Shopping</button>
                </div>
            `;
        } else {
            cartHTML += '<div class="cart-items">';
            let total = 0;

            this.cart.forEach(item => {
                const itemTotal = parseFloat(item.price) * item.quantity;
                total += itemTotal;
                
                cartHTML += `
                    <div class="cart-item" style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
                        <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;" alt="${item.name}">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 5px 0; font-size: 16px;">${item.name}</h4>
                            <p style="margin: 0; color: #666;">₹${item.price} x ${item.quantity}</p>
                        </div>
                        <button class="remove-item" data-id="${item.id}" style="background: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Remove</button>
                    </div>
                `;
            });

            cartHTML += `
                </div>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #f39c12;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0;">Total: ₹${total.toLocaleString()}</h3>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="close-modal" style="flex: 1; background: #6c757d; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer;">Continue Shopping</button>
                        <button class="checkout-btn" style="flex: 1; background: #f39c12; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer;">Checkout</button>
                    </div>
                </div>
            `;
        }

        cartContent.innerHTML = cartHTML;

        // Event listeners for modal
        cartContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal')) {
                modal.remove();
            }
            if (e.target.classList.contains('remove-item')) {
                const itemId = e.target.getAttribute('data-id');
                this.removeFromCart(itemId);
                modal.remove();
                this.showCart(); // Refresh cart
            }
            if (e.target.classList.contains('checkout-btn')) {
                modal.remove();
                window.location.href = 'checkout.html';
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        modal.appendChild(cartContent);
        return modal;
    }

    // Wishlist Modal
    showWishlist() {
        const wishlistModal = this.createWishlistModal();
        document.body.appendChild(wishlistModal);
    }

    createWishlistModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const wishlistContent = document.createElement('div');
        wishlistContent.className = 'wishlist-modal';
        wishlistContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;

        let wishlistHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #333; margin: 0;">Wishlist</h2>
                <button class="close-modal" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
        `;

        if (this.wishlist.length === 0) {
            wishlistHTML += `
                <p style="text-align: center; color: #666; margin: 40px 0;">Your wishlist is empty</p>
                <div style="text-align: center;">
                    <button class="close-modal" style="background: #f39c12; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">Continue Shopping</button>
                </div>
            `;
        } else {
            wishlistHTML += '<div class="wishlist-items">';

            this.wishlist.forEach(item => {
                wishlistHTML += `
                    <div class="wishlist-item" style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
                        <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;" alt="${item.name}">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 5px 0; font-size: 16px;">${item.name}</h4>
                            <p style="margin: 0; color: #f39c12; font-weight: bold;">₹${item.price}</p>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="add-to-cart-from-wishlist" data-id="${item.id}" style="background: #f39c12; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 12px;">Add to Cart</button>
                            <button class="remove-from-wishlist" data-id="${item.id}" style="background: #ff4d4d; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 12px;">Remove</button>
                        </div>
                    </div>
                `;
            });

            wishlistHTML += `
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button class="close-modal" style="background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">Continue Shopping</button>
                </div>
            `;
        }

        wishlistContent.innerHTML = wishlistHTML;

        // Event listeners for modal
        wishlistContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal')) {
                modal.remove();
            }
            if (e.target.classList.contains('remove-from-wishlist')) {
                const itemId = e.target.getAttribute('data-id');
                this.removeFromWishlist(itemId);
                modal.remove();
                this.showWishlist(); // Refresh wishlist
            }
            if (e.target.classList.contains('add-to-cart-from-wishlist')) {
                const itemId = e.target.getAttribute('data-id');
                const item = this.wishlist.find(w => w.id == itemId);
                if (item) {
                    this.addToCart(item);
                }
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        modal.appendChild(wishlistContent);
        return modal;
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the store when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.walkwayStore = new WalkWayStore();
});

// Mobile Navigation Functions
function toggleMobileNav() {
    const overlay = document.getElementById('mobileNavOverlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeMobileNav() {
    const overlay = document.getElementById('mobileNavOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Close mobile menu when clicking on overlay or navigation links
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('mobileNavOverlay');
    if (overlay) {
        // Close when clicking on overlay background
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeMobileNav();
            }
        });
        
        // Close when clicking on navigation links in mobile menu
        const mobileNavLinks = overlay.querySelectorAll('.nav a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileNav();
            });
        });
    }
});

// Additional utility functions for specific pages
function clearSearch() {
    const products = document.querySelectorAll('.product');
    products.forEach(product => {
        product.style.display = 'flex';
    });
    
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.value = '';
    });
    
    if (window.walkwayStore) {
        window.walkwayStore.showNotification('Search cleared', 'info');
    }
}

// Check login status and update header
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('walkway_logged_in') === 'true';
    const user = JSON.parse(localStorage.getItem('walkway_user'));
    
    if (isLoggedIn && user) {
        updateHeaderForLoggedInUser(user);
    }
}

function updateHeaderForLoggedInUser(user) {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            ${user.firstName}
        `;
        loginBtn.href = 'profile.html';
    }
}

function logout() {
    localStorage.removeItem('walkway_logged_in');
    localStorage.removeItem('walkway_user');
    window.location.reload();
}

// Checkout functionality
function showCheckout() {
    const cart = JSON.parse(localStorage.getItem('walkway_cart')) || [];
    if (cart.length === 0) {
        window.walkwayStore.showNotification('Your cart is empty!', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="checkout-content">
            <div class="checkout-header">
                <h2>Checkout</h2>
                <button class="close-btn">&times;</button>
            </div>
            
            <div class="checkout-body">
                <div class="order-summary">
                    <h3>Order Summary</h3>
                    <div class="order-items">
                        ${cart.map(item => `
                            <div class="order-item">
                                <img src="${item.image}" alt="${item.name}">
                                <div class="item-details">
                                    <h4>${item.name}</h4>
                                    <p>₹${item.price} × ${item.quantity}</p>
                                </div>
                                <div class="item-total">₹${item.price * item.quantity}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-total">
                        <div class="subtotal">Subtotal: ₹${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</div>
                        <div class="shipping">Shipping: ₹99</div>
                        <div class="total">Total: ₹${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 99}</div>
                    </div>
                </div>
                
                <div class="checkout-form">
                    <h3>Shipping Information</h3>
                    <form id="checkoutForm">
                        <div class="form-group">
                            <label>Full Name *</label>
                            <input type="text" name="fullName" required>
                        </div>
                        <div class="form-group">
                            <label>Email *</label>
                            <input type="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label>Phone *</label>
                            <input type="tel" name="phone" required>
                        </div>
                        <div class="form-group">
                            <label>Address *</label>
                            <textarea name="address" required></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>City *</label>
                                <input type="text" name="city" required>
                            </div>
                            <div class="form-group">
                                <label>Pincode *</label>
                                <input type="text" name="pincode" required>
                            </div>
                        </div>
                        
                        <h3>Payment Method</h3>
                        <div class="payment-methods">
                            <label class="payment-option">
                                <input type="radio" name="payment" value="cod" checked>
                                <span>Cash on Delivery</span>
                            </label>
                            <label class="payment-option">
                                <input type="radio" name="payment" value="upi">
                                <span>UPI Payment</span>
                            </label>
                            <label class="payment-option">
                                <input type="radio" name="payment" value="card">
                                <span>Credit/Debit Card</span>
                            </label>
                        </div>
                        
                        <button type="submit" class="place-order-btn">Place Order</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    const form = document.getElementById('checkoutForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        placeOrder(new FormData(form));
    });

    // Close modal
    modal.querySelector('.close-btn').addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function placeOrder(formData) {
    const cart = JSON.parse(localStorage.getItem('walkway_cart')) || [];
    const orderData = {
        orderId: 'ORD' + Date.now(),
        items: cart,
        customerInfo: {
            name: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            pincode: formData.get('pincode')
        },
        paymentMethod: formData.get('payment'),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 99,
        orderDate: new Date().toLocaleDateString(),
        status: 'Confirmed'
    };

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart
    localStorage.removeItem('walkway_cart');
    window.walkwayStore.updateCartCount();

    // Close checkout modal
    document.querySelector('.modal').remove();

    // Show success message
    showOrderSuccess(orderData.orderId);
}

function showOrderSuccess(orderId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="success-content">
            <div class="success-icon">✅</div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order ID is: <strong>${orderId}</strong></p>
            <p>You will receive a confirmation email shortly.</p>
            <div class="success-actions">
                <button class="continue-shopping-btn">Continue Shopping</button>
                <button class="view-orders-btn">View Orders</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.continue-shopping-btn').addEventListener('click', () => {
        modal.remove();
    });

    modal.querySelector('.view-orders-btn').addEventListener('click', () => {
        modal.remove();
        showOrders();
    });
}

function showOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="orders-content">
            <div class="orders-header">
                <h2>My Orders</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="orders-body">
                ${orders.length === 0 ? 
                    '<p class="no-orders">No orders found</p>' :
                    orders.map(order => `
                        <div class="order-card">
                            <div class="order-header">
                                <div class="order-id">Order #${order.orderId}</div>
                                <div class="order-status ${order.status.toLowerCase()}">${order.status}</div>
                            </div>
                            <div class="order-date">${order.orderDate}</div>
                            <div class="order-items">
                                ${order.items.map(item => `
                                    <div class="order-item">
                                        <img src="${item.image}" alt="${item.name}">
                                        <span>${item.name} × ${item.quantity}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="order-total">Total: ₹${order.total}</div>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close-btn').addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Filter functionality for sale page
function filterProducts(category) {
    const products = document.querySelectorAll('.product');
    let visibleCount = 0;

    products.forEach(product => {
        const productText = product.textContent.toLowerCase();
        
        if (category === 'all' || productText.includes(category.toLowerCase())) {
            product.style.display = 'flex';
            visibleCount++;
        } else {
            product.style.display = 'none';
        }
    });

    // Update filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(category.toLowerCase()) || 
            (category === 'all' && btn.textContent.toLowerCase().includes('all'))) {
            btn.classList.add('active');
        }
    });

    if (window.walkwayStore) {
        window.walkwayStore.showNotification(`Showing ${visibleCount} products`, 'info');
    }
}
