// home.js - Main Home Page Application
// ===============================================
// Version: 3.0 (Clean, structured, and fully functional)

// --- MOCK DATA (ควรมาจาก API ในแอปพลิเคชันจริง) ---
const MOCK_PRODUCTS = {
    1: { id: 1, name: 'ข้าวกล่องคลีน ไก่ย่าง', price: 89, image: '🍱' },
    2: { id: 2, name: 'สลัดผักสด น้ำสลัดงา', price: 79, image: '🥗' },
    3: { id: 3, name: 'โปรตีนบาร์ ช็อกโกแลต', price: 59, image: '🍪' },
    4: { id: 4, name: 'น้ำผลไม้สกัดเย็น', price: 49, image: '🥤' }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('🏠 Eco Life Home Page Initializing...');

    // --- STATE MANAGEMENT ---
    // จัดการข้อมูลและสถานะต่างๆ ของแอปพลิเคชัน
    const AppState = {
        cart: JSON.parse(localStorage.getItem('ecolife_cart')) || [],
        user: JSON.parse(localStorage.getItem('ecolife_user')) || null,
    };

    // --- DOM ELEMENTS ---
    // อ้างอิงถึง Element ทั้งหมดในหน้าเพื่อการเข้าถึงที่รวดเร็ว
    const DOM = {
        // Header
        searchInput: document.getElementById('search-input'),
        cartBtn: document.getElementById('cart-btn'),
        cartCount: document.getElementById('cart-count'),
        notificationBtn: document.getElementById('notification-btn'),
        
        // Hero Section
        orderNowBtn: document.getElementById('order-now-btn'),

        // Categories
        categoryCards: document.querySelectorAll('.category-card'),

        // Products
        addToCartBtns: document.querySelectorAll('.add-to-cart-btn'),
        productCards: document.querySelectorAll('.product-card'),

        // Promotions
        promotionCards: document.querySelectorAll('.promotion-card'),

        // Benefits
        signupBtn: document.getElementById('signup-btn'),

        // Bottom Navigation
        navItems: document.querySelectorAll('.nav-item'),

        // Overlays
        loadingOverlay: document.getElementById('loading-overlay'),
        successMessage: document.getElementById('success-message'),
    };

    // --- UTILITY FUNCTIONS ---
    // ฟังก์ชันช่วยเหลือที่ใช้บ่อย
    const Utils = {
        showLoading(message = 'กำลังโหลด...') {
            if (!DOM.loadingOverlay) return;
            DOM.loadingOverlay.querySelector('p').textContent = message;
            DOM.loadingOverlay.style.display = 'flex';
        },
        hideLoading() {
            if (DOM.loadingOverlay) DOM.loadingOverlay.style.display = 'none';
        },
        showMessage(message, type = 'success', duration = 2000) {
            if (!DOM.successMessage) return;
            const icon = type === 'success' ? '✅' : 'ℹ️';
            DOM.successMessage.querySelector('.success-icon').textContent = icon;
            DOM.successMessage.querySelector('.success-text').textContent = message;
            DOM.successMessage.style.display = 'flex';
            setTimeout(() => {
                DOM.successMessage.style.display = 'none';
            }, duration);
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
        createFlyToCartAnimation(button) {
            if (!DOM.cartBtn) return;
            const flyingItem = document.createElement('div');
            flyingItem.className = 'flying-cart-item';
            flyingItem.innerHTML = '🛒';
            const buttonRect = button.getBoundingClientRect();
            const cartRect = DOM.cartBtn.getBoundingClientRect();
            flyingItem.style.cssText = `
                position: fixed;
                left: ${buttonRect.left + buttonRect.width / 2}px;
                top: ${buttonRect.top + buttonRect.height / 2}px;
                z-index: 1001;
            `;
            document.body.appendChild(flyingItem);
            requestAnimationFrame(() => {
                flyingItem.style.transition = 'all 0.8s cubic-bezier(0.29, 0.55, 0.53, 1.15)';
                flyingItem.style.left = `${cartRect.left + cartRect.width / 2}px`;
                flyingItem.style.top = `${cartRect.top + cartRect.height / 2}px`;
                flyingItem.style.transform = 'scale(0.1)';
                flyingItem.style.opacity = '0';
            });
            setTimeout(() => flyingItem.remove(), 800);
        }
    };

    // --- NAVIGATION LOGIC ---
    // จัดการการนำทางไปยังหน้าต่างๆ
    const Navigation = {
        toProductListing(category = null, params = {}) {
            let url = '../Product/listing/product-listing.html';
            const urlParams = new URLSearchParams();
            if (category) urlParams.append('category', category);
            Object.entries(params).forEach(([key, value]) => urlParams.append(key, value));
            if (urlParams.toString()) url += '?' + urlParams.toString();
            window.location.href = url;
        },
        toProductDetail(productId) {
            if (productId) window.location.href = `../Product/detail/product-detail.html?id=${productId}`;
        },
        toCart() {
            window.location.href = '../cart/cart.html';
        },
        toLoyalty() {
            window.location.href = '../member/dashboard/member-dashboard.html';
        },
        toSignup() {
            window.location.href = '../auth/login/login.html';
        },
        toProfile() {
            window.location.href = '../member/profile/user-profile.html';
        },
        toNotifications() {
            window.location.href = '../notification/notifications.html';
        }
    };

    // --- CART LOGIC ---
    // จัดการตะกร้าสินค้า
    const Cart = {
        updateDisplay() {
            const totalItems = AppState.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            if (DOM.cartCount) {
                DOM.cartCount.textContent = totalItems;
                DOM.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
            }
        },
        add(productId, quantity = 1) {
            const product = MOCK_PRODUCTS[productId];
            if (!product) return false;

            const existingItem = AppState.cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                AppState.cart.push({ ...product, quantity });
            }
            localStorage.setItem('ecolife_cart', JSON.stringify(AppState.cart));
            this.updateDisplay();
            return true;
        }
    };

    // --- EVENT HANDLERS ---
    // จัดการการทำงานของแต่ละส่วน

    /**
     * Component 1: Header and Hero Section Events
     * - ปุ่ม "สั่งเลย"
     * - ปุ่มตะกร้าสินค้า
     * - การค้นหา
     */
    function setupHeaderAndHeroEvents() {
        // ปุ่ม "สั่งเลย"
        if (DOM.orderNowBtn) {
            DOM.orderNowBtn.addEventListener('click', () => {
                Utils.showLoading('กำลังไปที่หน้าสินค้า...');
                setTimeout(() => Navigation.toProductListing(), 500);
            });
        }

        // ปุ่มตะกร้า
        if (DOM.cartBtn) {
            DOM.cartBtn.addEventListener('click', Navigation.toCart);
        }

        // ปุ่มแจ้งเตือน
        if (DOM.notificationBtn) {
            DOM.notificationBtn.addEventListener('click', Navigation.toNotifications);
        }

        // การค้นหา
        if (DOM.searchInput) {
            DOM.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && DOM.searchInput.value.trim()) {
                    Navigation.toProductListing(null, { search: DOM.searchInput.value.trim() });
                }
            });
        }
    }

    /**
     * Component 2: Main Content Sections Events
     * - การ์ดหมวดหมู่
     * - การ์ดสินค้า และปุ่มเพิ่มลงตะกร้า
     * - การ์ดโปรโมชั่น
     * - ปุ่มสมัครสมาชิก
     */
    function setupSectionEvents() {
        // การ์ดหมวดหมู่
        DOM.categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                Navigation.toProductListing(category);
            });
        });

        // การ์ดสินค้า (คลิกเพื่อไปหน้ารายละเอียด)
        DOM.productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart-btn')) return; // ไม่ทำงานถ้ากดปุ่มเพิ่ม
                const productId = card.dataset.productId;
                Navigation.toProductDetail(productId);
            });
        });

        // ปุ่มเพิ่มลงตะกร้า
        DOM.addToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // หยุดไม่ให้ event click ของ card ทำงาน
                const productId = parseInt(btn.dataset.productId, 10);
                
                btn.disabled = true;
                btn.innerHTML = '✓';
                btn.classList.add('success');
                Utils.createFlyToCartAnimation(btn);

                setTimeout(() => {
                    if (Cart.add(productId)) {
                        Utils.showMessage(`เพิ่ม "${MOCK_PRODUCTS[productId].name}" สำเร็จ!`, 'success');
                    }
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.innerHTML = '+';
                        btn.classList.remove('success');
                    }, 1000);
                }, 300);
            });
        });

        // การ์ดโปรโมชั่น
        DOM.promotionCards.forEach(card => {
            card.addEventListener('click', () => {
                const promotionId = card.dataset.promotion;
                // สามารถเพิ่ม Logic การนำทางตามโปรโมชั่นได้ที่นี่
                console.log(`Clicked promotion: ${promotionId}`);
                Navigation.toProductListing(null, { promo: promotionId });
            });
        });

        // ปุ่มสมัครสมาชิก
        if (DOM.signupBtn) {
            DOM.signupBtn.addEventListener('click', Navigation.toSignup);
        }
    }

    /**
     * Component 3: Bottom Navigation Events
     * - จัดการการคลิกเมนูหลักด้านล่าง
     */
    function setupBottomNavEvents() {
        DOM.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const navTarget = item.dataset.nav;

                switch (navTarget) {
                    case 'home':
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        break;
                    case 'categories':
                        Navigation.toProductListing();
                        break;
                    case 'member':
                        Navigation.toLoyalty();
                        break;
                    case 'account':
                        Navigation.toProfile();
                        break;
                }
            });
        });
    }

    /**
     * Animation and Scroll Effects
     * - จัดการ Animation ตอนเลื่อนหน้าจอ
     */
    function setupAnimations() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.section, .product-card, .category-card, .promotion-card, .brand-item').forEach(el => {
                el.classList.add('animate-on-scroll');
                observer.observe(el);
            });
        }
    }

    // --- APPLICATION INITIALIZATION ---
    // ฟังก์ชันหลักสำหรับเริ่มต้นการทำงานทั้งหมด
    function init() {
        try {
            setupHeaderAndHeroEvents();
            setupSectionEvents();
            setupBottomNavEvents();
            setupAnimations();
            Cart.updateDisplay(); // อัปเดตจำนวนสินค้าในตะกร้าเมื่อโหลดหน้า
            console.log('✅ Eco Life Home Application Initialized Successfully!');
        } catch (error) {
            console.error('❌ Error initializing home application:', error);
            Utils.showMessage('เกิดข้อผิดพลาดในการโหลดหน้า', 'error');
        }
    }

    // เริ่มการทำงานของแอปพลิเคชัน
    init();
});