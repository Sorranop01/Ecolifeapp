// Product Detail - JavaScript Functionality
// Author: Frontend Developer AI
// Version: 1.0

// Global State Management
const ProductDetailState = {
    currentProduct: {
        id: 1,
        name: 'ข้าวกล่องคลีน ไก่ย่างสมุนไพร พร้อมผักสด',
        brand: 'Brand A',
        price: 89,
        originalPrice: 109,
        discount: 20,
        points: 89,
        rating: 4.8,
        reviewCount: 234,
        soldCount: 1200,
        images: ['🍱', '🥗', '🍗'],
        description: 'ข้าวกล่องคลีนสูตรพิเศษ อกไก่ย่างหมักสมุนไพรไทย 13 ชนิด ย่างจนหอมกรอบนอกนุ่มใน เสิร์ฟพร้อมข้าวกล้องหอมมะลิ และผักสดออร์แกนิค 5 สี ปรุงรสด้วยน้ำสลัดสูตรพิเศษ ไม่ใส่น้ำตาล MSG และสารกันบูด เหมาะสำหรับผู้ที่ต้องการควบคุมน้ำหนักและรักสุขภาพ',
        ingredients: [
            'อกไก่ออร์แกนิค 150 กรัม',
            'ข้าวกล้องหอมมะลิ 80 กรัม',
            'ผักสลัดรวม 5 สี 100 กรัม',
            'น้ำสลัดสูตรพิเศษไม่มีน้ำตาล'
        ],
        nutrition: {
            calories: 320,
            protein: 35,
            carbs: 28,
            fat: 8
        },
        tags: ['ต่ำแคลอรี่ 320 kcal', 'โปรตีนสูง 35g', 'ไขมันต่ำ', 'ลดน้ำหนัก']
    },
    currentImageIndex: 0,
    quantity: 1,
    isFavorite: false,
    cartCount: 3,
    relatedProducts: [
        { id: 2, name: 'ข้าวกล่องปลาแซลมอน', price: 129, image: '🐟' },
        { id: 3, name: 'สลัดอกไก่ย่าง', price: 99, image: '🥗' },
        { id: 4, name: 'ข้าวผัดกระเพราไก่', price: 79, image: '🍚' }
    ],
    reviews: [
        {
            id: 1,
            userName: 'สมชาย ใจดี',
            rating: 5,
            text: 'อร่อยมาก ไก่นุ่ม ข้าวหอม ผักสดใหม่ ส่งไวด้วย แนะนำเลย!',
            date: '3 วันที่แล้ว',
            avatar: '👤'
        },
        {
            id: 2,
            userName: 'สุดา รักสุขภาพ',
            rating: 5,
            text: 'คลีนจริงๆ แคลอรี่ต่ำ เหมาะกับคนลดน้ำหนัก รสชาติดีด้วย',
            date: '1 สัปดาห์ที่แล้ว',
            avatar: '👩'
        }
    ]
};

// DOM Elements
const DOM = {
    // Navigation
    backBtn: document.getElementById('back-btn'),
    shareBtn: document.getElementById('share-btn'),
    cartBtn: document.getElementById('cart-btn'),
    cartCount: document.getElementById('cart-count'),
    
    // Image Carousel
    productImages: document.getElementById('product-images'),
    imageCarousel: document.getElementById('image-carousel'),
    imageIndicators: document.getElementById('image-indicators'),
    indicators: document.querySelectorAll('.indicator'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    
    // Product Info
    currentPrice: document.getElementById('current-price'),
    originalPrice: document.getElementById('original-price'),
    pointsText: document.getElementById('points-text'),
    reviewsCount: document.getElementById('reviews-count'),
    expandDesc: document.getElementById('expand-desc'),
    seeAllReviews: document.getElementById('see-all-reviews'),
    reviewsList: document.getElementById('reviews-list'),
    
    // Actions
    favoriteBtn: document.getElementById('favorite-btn'),
    qtyMinus: document.getElementById('qty-minus'),
    qtyPlus: document.getElementById('qty-plus'),
    qtyValue: document.getElementById('qty-value'),
    addToCartBtn: document.getElementById('add-to-cart-btn'),
    
    // Related Products
    relatedProductCards: document.querySelectorAll('.related-product-card'),
    
    // Modals
    shareModal: document.getElementById('share-modal'),
    imageZoomModal: document.getElementById('image-zoom-modal'),
    closeShareModal: document.getElementById('close-share-modal'),
    closeZoomModal: document.getElementById('close-zoom-modal'),
    shareOptions: document.querySelectorAll('.share-option'),
    zoomImageContainer: document.getElementById('zoom-image-container'),
    
    // Notifications
    loadingOverlay: document.getElementById('loading-overlay'),
    successMessage: document.getElementById('success-message'),
    toastNotification: document.getElementById('toast-notification')
};

// Utility Functions
const Utils = {
    showLoading(message = 'กำลังโหลด...') {
        DOM.loadingOverlay.style.display = 'flex';
        DOM.loadingOverlay.querySelector('p').textContent = message;
    },
    
    hideLoading() {
        DOM.loadingOverlay.style.display = 'none';
    },
    
    showSuccess(message = 'เพิ่มลงตะกร้าสำเร็จ!') {
        const successText = DOM.successMessage.querySelector('.success-text');
        successText.textContent = message;
        DOM.successMessage.style.display = 'block';
        
        setTimeout(() => {
            DOM.successMessage.style.display = 'none';
        }, 2000);
    },
    
    showToast(message, icon = 'ℹ️') {
        const toastIcon = DOM.toastNotification.querySelector('.toast-icon');
        const toastText = DOM.toastNotification.querySelector('.toast-text');
        
        toastIcon.textContent = icon;
        toastText.textContent = message;
        DOM.toastNotification.style.display = 'block';
        
        setTimeout(() => {
            DOM.toastNotification.style.display = 'none';
        }, 3000);
    },
    
    formatPrice(price) {
        return `฿${price.toLocaleString()}`;
    },
    
    updateCartCount(count) {
        ProductDetailState.cartCount = count;
        DOM.cartCount.textContent = count;
        
        // Animate cart badge
        DOM.cartCount.style.animation = 'none';
        setTimeout(() => {
            DOM.cartCount.style.animation = 'pulse 0.5s ease-out';
        }, 10);
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    animateElement(element, className, duration = 500) {
        element.classList.add(className);
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }
};

// Image Carousel Manager
const ImageCarousel = {
    currentIndex: 0,
    touchStartX: 0,
    touchEndX: 0,
    isAnimating: false,
    
    init() {
        this.updateCarousel();
        this.attachEventListeners();
    },
    
    attachEventListeners() {
        // Click handlers for navigation buttons
        DOM.prevBtn.addEventListener('click', () => this.previous());
        DOM.nextBtn.addEventListener('click', () => this.next());
        
        // Click handlers for indicators
        DOM.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Touch/swipe handlers
        DOM.imageCarousel.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        });
        
        DOM.imageCarousel.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        // Image click for zoom
        DOM.imageCarousel.addEventListener('click', (e) => {
            if (e.target.closest('.product-image')) {
                this.openZoomModal();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!DOM.imageZoomModal.style.display || DOM.imageZoomModal.style.display === 'none') {
                if (e.key === 'ArrowLeft') this.previous();
                if (e.key === 'ArrowRight') this.next();
            }
        });
    },
    
    handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                this.previous();
            } else {
                this.next();
            }
        }
    },
    
    previous() {
        if (this.isAnimating) return;
        
        this.currentIndex = this.currentIndex === 0 
            ? ProductDetailState.currentProduct.images.length - 1 
            : this.currentIndex - 1;
        
        this.updateCarousel();
    },
    
    next() {
        if (this.isAnimating) return;
        
        this.currentIndex = this.currentIndex === ProductDetailState.currentProduct.images.length - 1 
            ? 0 
            : this.currentIndex + 1;
        
        this.updateCarousel();
    },
    
    goToSlide(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        
        this.currentIndex = index;
        this.updateCarousel();
    },
    
    updateCarousel() {
        this.isAnimating = true;
        
        // Update carousel position
        const translateX = -this.currentIndex * 100;
        DOM.imageCarousel.style.transform = `translateX(${translateX}%)`;
        
        // Update indicators
        DOM.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
        
        // Update state
        ProductDetailState.currentImageIndex = this.currentIndex;
        
        // Reset animation flag
        setTimeout(() => {
            this.isAnimating = false;
        }, 300);
    },
    
    openZoomModal() {
        const currentImage = ProductDetailState.currentProduct.images[this.currentIndex];
        const zoomImage = DOM.zoomImageContainer.querySelector('.zoom-image');
        
        zoomImage.textContent = currentImage;
        DOM.imageZoomModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },
    
    closeZoomModal() {
        DOM.imageZoomModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Quantity Manager
const QuantityManager = {
    init() {
        this.updateDisplay();
        this.attachEventListeners();
    },
    
    attachEventListeners() {
        DOM.qtyMinus.addEventListener('click', () => this.decrease());
        DOM.qtyPlus.addEventListener('click', () => this.increase());
        
        // Long press for rapid change
        this.setupLongPress(DOM.qtyMinus, () => this.decrease());
        this.setupLongPress(DOM.qtyPlus, () => this.increase());
    },
    
    setupLongPress(element, callback) {
        let pressTimer;
        let isLongPress = false;
        
        element.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => {
                isLongPress = true;
                this.startRapidChange(callback);
            }, 500);
        });
        
        element.addEventListener('mouseup', () => {
            clearTimeout(pressTimer);
            if (isLongPress) {
                this.stopRapidChange();
            }
            isLongPress = false;
        });
        
        element.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer);
            if (isLongPress) {
                this.stopRapidChange();
            }
            isLongPress = false;
        });
    },
    
    startRapidChange(callback) {
        this.rapidChangeInterval = setInterval(callback, 100);
    },
    
    stopRapidChange() {
        if (this.rapidChangeInterval) {
            clearInterval(this.rapidChangeInterval);
            this.rapidChangeInterval = null;
        }
    },
    
    decrease() {
        if (ProductDetailState.quantity > 1) {
            ProductDetailState.quantity--;
            this.updateDisplay();
            this.updatePrice();
        }
    },
    
    increase() {
        if (ProductDetailState.quantity < 99) {
            ProductDetailState.quantity++;
            this.updateDisplay();
            this.updatePrice();
        }
    },
    
    updateDisplay() {
        DOM.qtyValue.textContent = ProductDetailState.quantity;
        
        // Update button states
        DOM.qtyMinus.disabled = ProductDetailState.quantity <= 1;
        DOM.qtyPlus.disabled = ProductDetailState.quantity >= 99;
    },
    
    updatePrice() {
        const totalPrice = ProductDetailState.currentProduct.price * ProductDetailState.quantity;
        const totalPoints = ProductDetailState.currentProduct.points * ProductDetailState.quantity;
        
        DOM.currentPrice.textContent = Utils.formatPrice(totalPrice);
        DOM.pointsText.textContent = `รับ ${totalPoints} แต้มสะสม`;
        
        if (ProductDetailState.currentProduct.originalPrice) {
            const totalOriginalPrice = ProductDetailState.currentProduct.originalPrice * ProductDetailState.quantity;
            DOM.originalPrice.textContent = Utils.formatPrice(totalOriginalPrice);
        }
    }
};

// Cart Manager
const CartManager = {
    cart: JSON.parse(localStorage.getItem('ecolife_cart')) || [],
    
    init() {
        this.attachEventListeners();
        this.updateCartCount();
    },
    
    attachEventListeners() {
        DOM.addToCartBtn.addEventListener('click', () => this.addToCart());
    },
    
    addToCart() {
        const product = ProductDetailState.currentProduct;
        const quantity = ProductDetailState.quantity;
        
        // Show loading
        Utils.showLoading('กำลังเพิ่มลงตะกร้า...');
        
        // Simulate API call
        setTimeout(() => {
            // Check if product already in cart
            const existingItem = this.cart.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                this.cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                    quantity: quantity
                });
            }
            
            // Save to localStorage
            localStorage.setItem('ecolife_cart', JSON.stringify(this.cart));
            
            // Update cart count
            this.updateCartCount();
            
            // Hide loading and show success
            Utils.hideLoading();
            Utils.showSuccess(`เพิ่ม ${product.name} (${quantity} ชิ้น) ลงตะกร้าแล้ว`);
            
            // Animate add to cart button
            Utils.animateElement(DOM.addToCartBtn, 'success-animation');
            
            // Reset quantity to 1
            ProductDetailState.quantity = 1;
            QuantityManager.updateDisplay();
            QuantityManager.updatePrice();
            
        }, 800);
    },
    
    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        Utils.updateCartCount(totalItems);
    },
    
    getCartItems() {
        return this.cart;
    }
};

// Favorite Manager
const FavoriteManager = {
    favorites: JSON.parse(localStorage.getItem('ecolife_favorites')) || [],
    
    init() {
        this.updateFavoriteState();
        this.attachEventListeners();
    },
    
    attachEventListeners() {
        DOM.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
    },
    
    toggleFavorite() {
        const productId = ProductDetailState.currentProduct.id;
        const isFavorite = this.favorites.includes(productId);
        
        if (isFavorite) {
            this.favorites = this.favorites.filter(id => id !== productId);
            ProductDetailState.isFavorite = false;
            Utils.showToast('ลบออกจากรายการโปรด', '💔');
        } else {
            this.favorites.push(productId);
            ProductDetailState.isFavorite = true;
            Utils.showToast('เพิ่มเข้ารายการโปรด', '❤️');
        }
        
        // Save to localStorage
        localStorage.setItem('ecolife_favorites', JSON.stringify(this.favorites));
        
        // Update UI
        this.updateFavoriteState();
    },
    
    updateFavoriteState() {
        const productId = ProductDetailState.currentProduct.id;
        const isFavorite = this.favorites.includes(productId);
        
        ProductDetailState.isFavorite = isFavorite;
        DOM.favoriteBtn.classList.toggle('active', isFavorite);
        DOM.favoriteBtn.textContent = isFavorite ? '♥' : '♡';
    }
};

// Share Manager
const ShareManager = {
    init() {
        this.attachEventListeners();
    },
    
    attachEventListeners() {
        DOM.shareBtn.addEventListener('click', () => this.showShareModal());
        DOM.closeShareModal.addEventListener('click', () => this.hideShareModal());
        
        DOM.shareOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const platform = e.currentTarget.dataset.platform;
                this.shareTo(platform);
            });
        });
        
        // Close modal when clicking outside
        DOM.shareModal.addEventListener('click', (e) => {
            if (e.target === DOM.shareModal) {
                this.hideShareModal();
            }
        });
    },
    
    showShareModal() {
        DOM.shareModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },
    
    hideShareModal() {
        DOM.shareModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    },
    
    shareTo(platform) {
        const product = ProductDetailState.currentProduct;
        const url = window.location.href;
        const text = `${product.name} - ${Utils.formatPrice(product.price)} | Eco Life`;
        
        let shareUrl;
        
        switch (platform) {
            case 'line':
                shareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text + ' ' + url)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'copy':
                this.copyToClipboard(url);
                this.hideShareModal();
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
            this.hideShareModal();
        }
    },
    
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                Utils.showToast('คัดลอกลิงก์สำเร็จ', '📋');
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            Utils.showToast('คัดลอกลิงก์สำเร็จ', '📋');
        }
    }
};

// Reviews Manager
const ReviewsManager = {
    init() {
        this.renderReviews();
        this.attachEventListeners();
    },
    
    attachEventListeners() {
        DOM.seeAllReviews.addEventListener('click', () => this.showAllReviews());
        DOM.reviewsCount.addEventListener('click', () => this.showAllReviews());
    },
    
    renderReviews() {
        const reviews = ProductDetailState.reviews.slice(0, 2); // Show first 2 reviews
        
        DOM.reviewsList.innerHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">${review.avatar}</div>
                        <div class="reviewer-name">${review.userName}</div>
                    </div>
                    <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
                </div>
                <div class="review-text">${review.text}</div>
                <div class="review-date">${review.date}</div>
            </div>
        `).join('');
    },
    
    showAllReviews() {
        Utils.showLoading('กำลังโหลดรีวิว...');
        
        setTimeout(() => {
            Utils.hideLoading();
            Utils.showToast('เปิดหน้ารีวิวทั้งหมด', '⭐');
            console.log('Navigate to reviews page');
        }, 500);
    }
};

// Related Products Manager
const RelatedProductsManager = {
    init() {
        this.attachEventListeners();
    },
    
    attachEventListeners() {
        DOM.relatedProductCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                this.navigateToProduct(productId);
            });
        });
    },
    
    navigateToProduct(productId) {
        // Navigate to the detail page for the clicked related product.
        window.location.href = `product-detail.html?id=${productId}`;
    }
};

// Navigation Manager
const NavigationManager = {
    init() {
        this.attachEventListeners();
    },
    
    attachEventListeners() {
        DOM.backBtn.addEventListener('click', () => this.goBack());
        DOM.cartBtn.addEventListener('click', () => this.goToCart());
    },
    
    goBack() {
        // Check if there is a page to go back to in the history from the same site
        if (document.referrer && document.referrer.startsWith(window.location.origin)) {
            history.back();
        } else {
            // If not (e.g., page was opened directly), go to a default page
            window.location.href = 'product-listing.html';
        }
    },
    
    goToCart() {
        // Navigate to the cart page.
        window.location.href = 'cart.html';
    }
};

// Description Manager
const DescriptionManager = {
    isExpanded: false,
    
    init() {
        this.attachEventListeners();
    },
    
    attachEventListeners() {
        DOM.expandDesc.addEventListener('click', () => this.toggleDescription());
    },
    
    toggleDescription() {
        this.isExpanded = !this.isExpanded;
        
        const descriptionText = document.querySelector('.description-text');
        
        if (this.isExpanded) {
            descriptionText.style.maxHeight = 'none';
            descriptionText.style.overflow = 'visible';
            DOM.expandDesc.textContent = 'ย่อ';
        } else {
            descriptionText.style.maxHeight = '4.5em';
            descriptionText.style.overflow = 'hidden';
            DOM.expandDesc.textContent = 'อ่านเพิ่มเติม';
        }
    }
};

// Keyboard Shortcuts Manager
const KeyboardManager = {
    init() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    },
    
    handleKeyDown(event) {
        // Escape key - close modals
        if (event.key === 'Escape') {
            if (DOM.shareModal.style.display === 'flex') {
                ShareManager.hideShareModal();
            }
            if (DOM.imageZoomModal.style.display === 'flex') {
                ImageCarousel.closeZoomModal();
            }
        }
        
        // Space key - add to cart
        if (event.key === ' ' && !event.target.matches('input, textarea')) {
            event.preventDefault();
            CartManager.addToCart();
        }
        
        // F key - toggle favorite
        if (event.key === 'f' || event.key === 'F') {
            event.preventDefault();
            FavoriteManager.toggleFavorite();
        }
        
        // S key - share
        if (event.key === 's' || event.key === 'S') {
            event.preventDefault();
            ShareManager.showShareModal();
        }
        
        // Plus/Minus keys for quantity
        if (event.key === '+' || event.key === '=') {
            event.preventDefault();
            QuantityManager.increase();
        }
        if (event.key === '-' || event.key === '_') {
            event.preventDefault();
            QuantityManager.decrease();
        }
    }
};

// Performance Manager
const PerformanceManager = {
    init() {
        this.setupLazyLoading();
        this.setupScrollOptimization();
        this.preloadImages();
    },
    
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        // Load actual images here
                        observer.unobserve(element);
                    }
                });
            });
            
            // Observe elements that need lazy loading
            document.querySelectorAll('.related-product-image').forEach(img => {
                observer.observe(img);
            });
        }
    },
    
    setupScrollOptimization() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Handle scroll-based effects
                    this.updateScrollEffects();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', handleScroll);
    },
    
    updateScrollEffects() {
        const scrollY = window.scrollY;
        const header = document.querySelector('header');
        
        // Update header background based on scroll
        if (scrollY > 100) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        } else {
            header.style.backgroundColor = 'transparent';
        }
    },
    
    preloadImages() {
        // Preload next/previous images for smoother carousel
        ProductDetailState.currentProduct.images.forEach(image => {
            const img = new Image();
            img.src = image; // In real app, this would be actual image URLs
        });
    }
};

// Analytics Manager
const AnalyticsManager = {
    init() {
        this.trackPageView();
        this.setupEventTracking();
    },
    
    trackPageView() {
        // Track product view
        console.log('Analytics: Product viewed', {
            productId: ProductDetailState.currentProduct.id,
            productName: ProductDetailState.currentProduct.name,
            price: ProductDetailState.currentProduct.price,
            timestamp: new Date().toISOString()
        });
    },
    
    setupEventTracking() {
        // Track add to cart
        DOM.addToCartBtn.addEventListener('click', () => {
            console.log('Analytics: Add to cart', {
                productId: ProductDetailState.currentProduct.id,
                quantity: ProductDetailState.quantity,
                totalValue: ProductDetailState.currentProduct.price * ProductDetailState.quantity
            });
        });
        
        // Track favorite toggle
        DOM.favoriteBtn.addEventListener('click', () => {
            console.log('Analytics: Favorite toggled', {
                productId: ProductDetailState.currentProduct.id,
                isFavorite: !ProductDetailState.isFavorite
            });
        });
        
        // Track share
        DOM.shareBtn.addEventListener('click', () => {
            console.log('Analytics: Share initiated', {
                productId: ProductDetailState.currentProduct.id
            });
        });
    }
};

// App Initialization
const ProductDetailApp = {
    init() {
        console.log('📦 Product Detail App Initializing...');
        
        try {
            // Initialize all managers in order
            ImageCarousel.init();
            QuantityManager.init();
            CartManager.init();
            FavoriteManager.init();
            ShareManager.init();
            ReviewsManager.init();
            RelatedProductsManager.init();
            NavigationManager.init();
            DescriptionManager.init();
            KeyboardManager.init();
            PerformanceManager.init();
            AnalyticsManager.init();
            
            // Set up modal close handlers
            this.setupModalHandlers();
            
            // Set up error handling
            this.setupErrorHandling();
            
            console.log('✅ Product Detail App Initialized Successfully!');
            
            // Show welcome message
            setTimeout(() => {
                Utils.showToast('ยินดีต้อนรับสู่หน้าสินค้า! 📦', '🎉');
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error initializing Product Detail App:', error);
            Utils.showToast('เกิดข้อผิดพลาดในการโหลดหน้า', '❌');
        }
    },
    
    setupModalHandlers() {
        // Close zoom modal
        DOM.closeZoomModal.addEventListener('click', () => {
            ImageCarousel.closeZoomModal();
        });
        
        // Close modals when clicking outside
        DOM.imageZoomModal.addEventListener('click', (e) => {
            if (e.target === DOM.imageZoomModal) {
                ImageCarousel.closeZoomModal();
            }
        });
    },
    
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            Utils.showToast('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', '⚠️');
        });
        
        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            Utils.showToast('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', '⚠️');
        });
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ProductDetailApp.init();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - pausing timers');
    } else {
        console.log('Page visible - resuming timers');
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    Utils.showToast('กลับมาออนไลน์แล้ว', '📶');
});

window.addEventListener('offline', () => {
    Utils.showToast('ออฟไลน์ - บางฟีเจอร์อาจไม่ทำงาน', '📵');
});

// Add custom CSS animations
const style = document.createElement('style');
style.textContent = `
    .success-animation {
        animation: successPulse 0.6s ease-out !important;
    }
    
    @keyframes successPulse {
        0% { transform: scale(1); background-color: var(--primary-green); }
        50% { transform: scale(1.05); background-color: var(--success); }
        100% { transform: scale(1); background-color: var(--primary-green); }
    }
    
    .shake-animation {
        animation: shake 0.5s ease-in-out !important;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Export for use in other modules
window.ProductDetailApp = {
    ProductDetailState,
    Utils,
    ImageCarousel,
    QuantityManager,
    CartManager,
    FavoriteManager,
    ShareManager
};