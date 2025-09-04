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
        const price = priceElement ? priceElement.textContent.replace(/[^\d.,]/g, '') : '0';
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
                const itemTotal = parseFloat(item.price.replace(/[^\d.]/g, '')) * item.quantity;
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
                this.showNotification('Checkout functionality coming soon!', 'info');
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
