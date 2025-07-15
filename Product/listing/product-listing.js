// product-listing.js - JavaScript หลักสำหรับหน้ารายการสินค้า Eco Life
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📂 Product Listing Page Loading...');

    // --- STATE MANAGEMENT ---
    const AppState = {
        // Cart & User data
        cart: JSON.parse(localStorage.getItem('ecolife_cart')) || [],
        favorites: JSON.parse(localStorage.getItem('ecolife_favorites')) || [],
        user: JSON.parse(localStorage.getItem('ecolife_user')) || null,

        // Product data
        allProducts: [],
        filteredProducts: [],
        displayedProducts: [],

        // UI State
        currentPage: 1,
        itemsPerPage: 8,
        isLoading: false,
        hasMoreProducts: true,

        // Filters & Sorting
        activeFilters: {
            category: 'all',
            brands: [],
            priceRange: { min: 0, max: 1000 },
            tags: [],
            inStock: true
        },
        currentSort: 'popular',
        searchTerm: '',

        // URL parameters
        urlParams: new URLSearchParams(window.location.search)
    };

    // --- DOM ELEMENTS ---
    const DOM = {
        // Header
        backBtn: document.getElementById('back-btn'),
        pageTitle: document.getElementById('page-title'),
        searchInput: document.getElementById('search-input'), // เพิ่ม element สำหรับช่องค้นหา
        searchClearBtn: document.getElementById('search-clear-btn'), // เพิ่ม element สำหรับปุ่มล้างการค้นหา
        searchBtn: document.getElementById('search-btn'),
        cartBtn: document.getElementById('cart-btn'),
        cartCount: document.getElementById('cart-count'),

        // Filter bar
        filterBar: document.getElementById('filter-bar'),
        filterChips: document.querySelectorAll('.filter-chip'),

        // Sort bar
        sortBar: document.querySelector('.sort-bar'),
        resultsCount: document.getElementById('results-count'),
        sortBtn: document.getElementById('sort-btn'),
        sortText: document.getElementById('sort-text'),

        // Products
        productsGrid: document.getElementById('products-grid'),
        loadMoreBtn: document.getElementById('load-more-btn'),

        // Floating filter
        floatingFilterBtn: document.getElementById('floating-filter-btn'),

        // Sort Modal
        sortModal: document.getElementById('sort-modal'),
        closeSortModal: document.getElementById('close-sort-modal'),
        sortOptions: document.querySelectorAll('.sort-option'),

        // Filter Modal
        filterModal: document.getElementById('filter-modal'),
        closeFilterModal: document.getElementById('close-filter-modal'),
        applyFiltersBtn: document.getElementById('apply-filters'),
        clearFiltersBtn: document.getElementById('clear-filters'),
        priceMinInput: document.getElementById('price-min'),
        priceMaxInput: document.getElementById('price-max'),
        priceMinValue: document.getElementById('price-min-value'),
        priceMaxValue: document.getElementById('price-max-value'),

        // Bottom Navigation
        bottomNav: document.querySelector('.bottom-nav'),
        navItems: document.querySelectorAll('.nav-item'),

        // Overlays
        loadingOverlay: document.getElementById('loading-overlay'),
        successMessage: document.getElementById('success-message')
    };

    // --- MOCK PRODUCT DATA ---
    const MOCK_PRODUCTS = [
        // Clean Food Category
        {
            id: 1, name: 'ข้าวกล่องคลีน ไก่ย่าง', price: 89, originalPrice: 109, discount: 18,
            points: 89, image: '🍱', category: 'clean-food', brand: 'brand-a',
            tags: ['ต่ำแคล', 'โปรตีนสูง'], rating: 4.8, soldCount: 1200, date: '2024-01-15', inStock: true
        },
        {
            id: 2, name: 'สลัดผักสด น้ำสลัดงา', price: 79, points: 79, image: '🥗',
            category: 'clean-food', brand: 'brand-b', tags: ['ออร์แกนิค', 'ไฟเบอร์สูง'],
            rating: 4.6, soldCount: 890, date: '2024-01-12', inStock: true
        },
        {
            id: 5, name: 'ข้าวกล่องปลาแซลมอน', price: 129, originalPrice: 149, discount: 13,
            points: 129, image: '🐟', category: 'clean-food', brand: 'brand-c',
            tags: ['โอเมก้า 3', 'โปรตีนสูง'], rating: 4.9, soldCount: 756, date: '2024-01-10', inStock: true
        },
        {
            id: 6, name: 'สเต็กเนื้อย่าง คลีน', price: 159, points: 159, image: '🥩',
            category: 'clean-food', brand: 'brand-a', tags: ['โปรตีนสูง', 'เนื้อแท้'],
            rating: 4.7, soldCount: 543, date: '2024-01-08', inStock: true
        },

        // Healthy Snacks Category
        {
            id: 3, name: 'โปรตีนบาร์ ช็อกโกแลต', price: 59, originalPrice: 69, discount: 14,
            points: 59, image: '🍪', category: 'healthy-snacks', brand: 'brand-c',
            tags: ['โปรตีนสูง', 'พลังงาน'], rating: 4.7, soldCount: 2100, date: '2024-01-14', inStock: true
        },
        {
            id: 7, name: 'ถั่วอัลมอนด์คั่ว', price: 45, points: 45, image: '🥜',
            category: 'healthy-snacks', brand: 'brand-b', tags: ['ไขมันดี', 'ไฟเบอร์'],
            rating: 4.5, soldCount: 1350, date: '2024-01-13', inStock: true
        },
        {
            id: 8, name: 'กรานาล่าโฮมเมด', price: 85, points: 85, image: '🥣',
            category: 'healthy-snacks', brand: 'brand-a', tags: ['ไฟเบอร์สูง', 'ไม่มีน้ำตาล'],
            rating: 4.6, soldCount: 920, date: '2024-01-11', inStock: false
        },

        // Beverages Category
        {
            id: 4, name: 'น้ำผลไม้สกัดเย็น', price: 49, points: 49, image: '🥤',
            category: 'beverages', brand: 'brand-a', tags: ['วิตามินสูง', 'ไม่มีน้ำตาล'],
            rating: 4.5, soldCount: 1800, date: '2024-01-16', inStock: true
        },
        {
            id: 9, name: 'สมูทตี้โปรตีน', price: 69, originalPrice: 79, discount: 13,
            points: 69, image: '🥛', category: 'beverages', brand: 'brand-c',
            tags: ['โปรตีน', 'วิตามิน'], rating: 4.8, soldCount: 1450, date: '2024-01-09', inStock: true
        },
        {
            id: 10, name: 'ชาเขียวมัทฉะ', price: 39, points: 39, image: '🍵',
            category: 'beverages', brand: 'brand-b', tags: ['แอนติออกซิแดนต์', 'คาเฟอีน'],
            rating: 4.4, soldCount: 670, date: '2024-01-07', inStock: true
        },

        // Supplements Category  
        {
            id: 11, name: 'วิตามินซี 1000mg', price: 299, points: 299, image: '💊',
            category: 'supplements', brand: 'brand-a', tags: ['วิตามิน', 'ภูมิคุ้มกัน'],
            rating: 4.6, soldCount: 890, date: '2024-01-06', inStock: true
        },
        {
            id: 12, name: 'โปรตีนพาวเดอร์ ช็อกโกแลต', price: 899, originalPrice: 999, discount: 10,
            points: 899, image: '🥤', category: 'supplements', brand: 'brand-c',
            tags: ['โปรตีน', 'เพิ่มกล้าม'], rating: 4.9, soldCount: 1200, date: '2024-01-05', inStock: true
        }
    ];

    // --- UTILITY FUNCTIONS ---
    const Utils = {
        /**
         * แสดงข้อความแจ้งเตือน
         */
        showMessage(message, type = 'success', duration = 3000) {
            if (!DOM.successMessage) return;

            const successText = DOM.successMessage.querySelector('.success-text');
            const successIcon = DOM.successMessage.querySelector('.success-icon');

            if (successText) successText.textContent = message;

            if (successIcon) {
                const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
                successIcon.textContent = icons[type] || icons.success;
            }

            DOM.successMessage.style.display = 'flex';
            setTimeout(() => DOM.successMessage.style.display = 'none', duration);
        },

        /**
         * แสดง/ซ่อน Loading
         */
        showLoading(message = 'กำลังโหลด...') {
            if (!DOM.loadingOverlay) return;
            AppState.isLoading = true;
            
            const loadingText = DOM.loadingOverlay.querySelector('p');
            if (loadingText) loadingText.textContent = message;
            
            DOM.loadingOverlay.style.display = 'flex';
        },

        hideLoading() {
            if (!DOM.loadingOverlay) return;
            AppState.isLoading = false;
            DOM.loadingOverlay.style.display = 'none';
        },

        /**
         * Debounce function
         */
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

        /**
         * Format ราคา
         */
        formatPrice(price) {
            return `฿${price.toLocaleString()}`;
        },

        /**
         * Track Analytics Event
         */
        trackEvent(eventName, data = {}) {
            console.log('📊 Analytics Event:', eventName, data);
        },

        /**
         * Get URL parameters
         */
        getUrlParam(param, defaultValue = null) {
            return AppState.urlParams.get(param) || defaultValue;
        },

        /**
         * Update URL without reload
         */
        updateUrl(params) {
            const url = new URL(window.location);
            Object.keys(params).forEach(key => {
                if (params[key]) {
                    url.searchParams.set(key, params[key]);
                } else {
                    url.searchParams.delete(key);
                }
            });
            window.history.replaceState({}, '', url);
        }
    };

    // --- CART MANAGEMENT ---
    const CartManager = {
        /**
         * อัปเดตจำนวนสินค้าในตะกร้า
         */
        updateCartCount() {
            const totalItems = AppState.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            
            if (DOM.cartCount) {
                DOM.cartCount.textContent = totalItems;
                DOM.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
            }
        },

        /**
         * เพิ่มสินค้าลงตะกร้า
         */
        addToCart(productId, quantity = 1) {
            const product = AppState.allProducts.find(p => p.id === productId);
            if (!product) {
                Utils.showMessage('ไม่พบสินค้าที่เลือก', 'error');
                return false;
            }

            if (!product.inStock) {
                Utils.showMessage('สินค้าหมด กรุณาเลือกสินค้าอื่น', 'warning');
                return false;
            }

            const existingItem = AppState.cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + quantity;
            } else {
                AppState.cart.push({
                    id: productId,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity,
                    addedAt: new Date().toISOString()
                });
            }

            localStorage.setItem('ecolife_cart', JSON.stringify(AppState.cart));
            this.updateCartCount();
            Utils.showMessage(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว! 🛒`, 'success');

            Utils.trackEvent('add_to_cart', {
                productId, productName: product.name, price: product.price, quantity
            });

            return true;
        }
    };

    // --- FILTER MANAGEMENT ---
    const FilterManager = {
        init() {
            this.setupFilterChips();
            this.setupAdvancedFilters();
            this.setupFloatingFilter();
            this.loadInitialFilters();
        },

        setupFilterChips() {
            DOM.filterChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    this.handleFilterChipClick(chip);
                });
            });
        },

        setupAdvancedFilters() {
            // Price range sliders
            if (DOM.priceMinInput && DOM.priceMaxInput) {
                DOM.priceMinInput.addEventListener('input', () => this.updatePriceRangeDisplay());
                DOM.priceMaxInput.addEventListener('input', () => this.updatePriceRangeDisplay());
            }

            // Apply filters button
            if (DOM.applyFiltersBtn) {
                DOM.applyFiltersBtn.addEventListener('click', () => this.applyAdvancedFilters());
            }

            // Clear filters button
            if (DOM.clearFiltersBtn) {
                DOM.clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
            }
        },

        setupFloatingFilter() {
            if (DOM.floatingFilterBtn) {
                DOM.floatingFilterBtn.addEventListener('click', () => {
                    this.showAdvancedFiltersModal();
                });
            }
        },

        loadInitialFilters() {
            // Load filters from URL
            const category = Utils.getUrlParam('category');
            const brand = Utils.getUrlParam('brand');
            const search = Utils.getUrlParam('search');

            if (category && category !== 'all') {
                AppState.activeFilters.category = category;
                this.updateFilterChipState(category);
                this.updatePageTitle(category);
            }

            if (brand) {
                AppState.activeFilters.brands = [brand];
            }

            if (search) {
                AppState.searchTerm = search;
                this.updatePageTitle(`ผลการค้นหา: ${search}`);
                if (DOM.searchInput) {
                    DOM.searchInput.value = search;
                }
                if (DOM.searchClearBtn) {
                    DOM.searchClearBtn.style.display = 'block';
                }
            }
        },

        handleFilterChipClick(chip) {
            const filterValue = chip.dataset.filter;
            
            // Update active state
            DOM.filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Update filter state
            AppState.activeFilters.category = filterValue;

            // Apply filters
            this.applyFilters();

            // Track event
            Utils.trackEvent('filter_chip_click', { filter: filterValue });

            // Update URL
            Utils.updateUrl({ category: filterValue === 'all' ? null : filterValue });
        },

        updateFilterChipState(category) {
            DOM.filterChips.forEach(chip => {
                chip.classList.toggle('active', chip.dataset.filter === category);
            });
        },

        updatePageTitle(title) {
            if (DOM.pageTitle) {
                const titles = {
                    'clean-food': 'อาหารคลีน',
                    'healthy-snacks': 'ขนมสุขภาพ',
                    'beverages': 'เครื่องดื่ม',
                    'supplements': 'อาหารเสริม',
                    'all': 'สินค้าทั้งหมด'
                };
                DOM.pageTitle.textContent = titles[title] || title;
            }
        },

        updatePriceRangeDisplay() {
            let min = parseInt(DOM.priceMinInput.value);
            let max = parseInt(DOM.priceMaxInput.value);

            // Ensure min is not greater than max
            if (min > max) {
                [min, max] = [max, min];
                DOM.priceMinInput.value = min;
                DOM.priceMaxInput.value = max;
            }

            if (DOM.priceMinValue) DOM.priceMinValue.textContent = Utils.formatPrice(min);
            if (DOM.priceMaxValue) DOM.priceMaxValue.textContent = Utils.formatPrice(max);
        },

        showAdvancedFiltersModal() {
            if (DOM.filterModal) {
                DOM.filterModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        },

        hideAdvancedFiltersModal() {
            if (DOM.filterModal) {
                DOM.filterModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        },

        applyAdvancedFilters() {
            // Update price range
            AppState.activeFilters.priceRange = {
                min: parseInt(DOM.priceMinInput.value),
                max: parseInt(DOM.priceMaxInput.value)
            };

            // Update brand filters
            const brandCheckboxes = DOM.filterModal.querySelectorAll('input[value^="brand-"]:checked');
            AppState.activeFilters.brands = Array.from(brandCheckboxes).map(cb => cb.value);

            // Update tag filters
            const tagCheckboxes = DOM.filterModal.querySelectorAll('input[value]:not([value^="brand-"]):checked');
            AppState.activeFilters.tags = Array.from(tagCheckboxes).map(cb => cb.value);

            // Apply filters
            this.applyFilters();

            // Hide modal
            this.hideAdvancedFiltersModal();

            // Track event
            Utils.trackEvent('advanced_filters_applied', AppState.activeFilters);
        },

        clearAllFilters() {
            // Reset to default state
            AppState.activeFilters = {
                category: 'all',
                brands: [],
                priceRange: { min: 0, max: 1000 },
                tags: [],
                inStock: true
            };

            // Reset UI
            DOM.filterChips.forEach(chip => {
                chip.classList.toggle('active', chip.dataset.filter === 'all');
            });

            if (DOM.priceMinInput) DOM.priceMinInput.value = 0;
            if (DOM.priceMaxInput) DOM.priceMaxInput.value = 1000;
            this.updatePriceRangeDisplay();

            // Reset checkboxes
            const checkboxes = DOM.filterModal?.querySelectorAll('input[type="checkbox"]');
            checkboxes?.forEach(cb => cb.checked = false);
            
            // Apply filters
            this.applyFilters();

            // Update URL
            Utils.updateUrl({ category: null, brand: null, search: null });
        },

        applyFilters() {
            Utils.showLoading('กำลังกรองสินค้า...');

            setTimeout(() => {
                // Filter products
                AppState.filteredProducts = this.filterProducts(AppState.allProducts);

                // Reset pagination
                AppState.currentPage = 1;
                AppState.hasMoreProducts = true;

                // Update display
                ProductManager.renderProducts();
                this.updateResultsCount();

                Utils.hideLoading();
            }, 300);
        },

        filterProducts(products) {
            return products.filter(product => {
                // Category filter
                if (AppState.activeFilters.category !== 'all' && 
                    product.category !== AppState.activeFilters.category) {
                    return false;
                }

                // Brand filter
                if (AppState.activeFilters.brands.length > 0 && 
                    !AppState.activeFilters.brands.includes(product.brand)) {
                    return false;
                }

                // Price range filter
                if (product.price < AppState.activeFilters.priceRange.min || 
                    product.price > AppState.activeFilters.priceRange.max) {
                    return false;
                }

                // Tag filter
                if (AppState.activeFilters.tags.length > 0 && 
                    !AppState.activeFilters.tags.some(tag => product.tags.includes(tag))) {
                    return false;
                }

                // Stock filter
                if (AppState.activeFilters.inStock && !product.inStock) {
                    return false;
                }

                // Search filter
                if (AppState.searchTerm && 
                    !product.name.toLowerCase().includes(AppState.searchTerm.toLowerCase())) {
                    return false;
                }

                return true;
            });
        },

        updateResultsCount() {
            if (DOM.resultsCount) {
                DOM.resultsCount.textContent = `พบ ${AppState.filteredProducts.length} รายการ`;
            }
        }
    };

    // --- SORT MANAGEMENT ---
    const SortManager = {
        init() {
            this.setupSortButton();
            this.setupSortModal();
        },

        setupSortButton() {
            if (DOM.sortBtn) {
                DOM.sortBtn.addEventListener('click', () => this.showSortModal());
            }
        },

        setupSortModal() {
            // Close modal buttons
            if (DOM.closeSortModal) {
                DOM.closeSortModal.addEventListener('click', () => this.hideSortModal());
            }

            // Sort options
            DOM.sortOptions.forEach(option => {
                option.addEventListener('click', () => {
                    this.handleSortOptionClick(option);
                });
            });

            // Click outside to close
            if (DOM.sortModal) {
                DOM.sortModal.addEventListener('click', (e) => {
                    if (e.target === DOM.sortModal) {
                        this.hideSortModal();
                    }
                });
            }
        },

        showSortModal() {
            if (DOM.sortModal) {
                DOM.sortModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        },

        hideSortModal() {
            if (DOM.sortModal) {
                DOM.sortModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        },

        handleSortOptionClick(option) {
            const sortValue = option.dataset.sort;
            
            // Update active state
            DOM.sortOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            // Update sort state
            AppState.currentSort = sortValue;

            // Update sort text
            if (DOM.sortText) {
                DOM.sortText.textContent = `เรียงตาม: ${option.querySelector('span').textContent}`;
            }

            // Apply sort
            this.applySort();

            // Hide modal
            this.hideSortModal();

            // Track event
            Utils.trackEvent('sort_option_selected', { sort: sortValue });
        },

        applySort() {
            Utils.showLoading('กำลังเรียงสินค้า...');

            setTimeout(() => {
                AppState.filteredProducts = this.sortProducts(AppState.filteredProducts);
                
                // Reset pagination
                AppState.currentPage = 1;
                
                // Update display
                ProductManager.renderProducts();
                
                Utils.hideLoading();
            }, 300);
        },

        sortProducts(products) {
            return [...products].sort((a, b) => {
                switch (AppState.currentSort) {
                    case 'price-low':
                        return a.price - b.price;
                    case 'price-high':
                        return b.price - a.price;
                    case 'newest':
                        return new Date(b.date) - new Date(a.date);
                    case 'rating':
                        return b.rating - a.rating;
                    case 'popular':
                    default:
                        return b.soldCount - a.soldCount;
                }
            });
        }
    };

    // --- PRODUCT MANAGEMENT ---
    const ProductManager = {
        init() {
            this.setupProductInteractions();
            this.setupLoadMore();
        },

        setupProductInteractions() {
            // Use event delegation for dynamic products
            if (DOM.productsGrid) {
                DOM.productsGrid.addEventListener('click', (e) => {
                    // Handle add to cart
                    if (e.target.closest('.add-to-cart-btn')) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.handleAddToCart(e);
                        return;
                    }

                    // Handle product click
                    const productCard = e.target.closest('.product-card');
                    if (productCard) {
                        this.handleProductClick(productCard);
                    }
                });
            }
        },

        setupLoadMore() {
            if (DOM.loadMoreBtn) {
                DOM.loadMoreBtn.addEventListener('click', () => {
                    this.loadMoreProducts();
                });
            }
        },

        renderProducts(append = false) {
            if (!DOM.productsGrid) return;

            const startIndex = append ? AppState.displayedProducts.length : 0;
            const endIndex = startIndex + AppState.itemsPerPage;
            const productsToShow = AppState.filteredProducts.slice(startIndex, endIndex);

            if (!append) {
                DOM.productsGrid.innerHTML = '';
                AppState.displayedProducts = [];
            }

            if (productsToShow.length === 0 && !append) {
                this.showEmptyState();
                return;
            }

            // Add products to displayed list
            AppState.displayedProducts.push(...productsToShow);

            // Render product cards
            const productsHTML = productsToShow.map((product, index) => 
                this.createProductCardHTML(product, startIndex + index)
            ).join('');

            if (append) {
                DOM.productsGrid.insertAdjacentHTML('beforeend', productsHTML);
            } else {
                DOM.productsGrid.innerHTML = productsHTML;
            }

            // Update load more button
            this.updateLoadMoreButton();

            // Animate new products
            this.animateNewProducts(productsToShow.length, append);
        },

        createProductCardHTML(product, index) {
            const originalPriceHTML = product.originalPrice ? 
                `<span class="original-price">${Utils.formatPrice(product.originalPrice)}</span>` : '';
            
            const discountBadgeHTML = product.discount ? 
                `<span class="discount-badge">-${product.discount}%</span>` : '';
            
            const outOfStockHTML = !product.inStock ? 
                `<div class="out-of-stock-overlay">สินค้าหมด</div>` : '';

            return `
                <div class="product-card" data-product-id="${product.id}" style="animation-delay: ${index * 0.1}s">
                    <div class="product-image">
                        <div class="product-badges">
                            <span class="free-delivery-badge">จัดส่งฟรี</span>
                            ${discountBadgeHTML}
                        </div>
                        <div class="product-image-placeholder">${product.image}</div>
                        ${outOfStockHTML}
                    </div>
                    <div class="product-info">
                        <div class="brand-name">${this.getBrandName(product.brand)}</div>
                        <div class="product-name">${product.name}</div>
                        <div class="product-rating">
                            <span class="stars">${'⭐'.repeat(Math.floor(product.rating))}</span>
                            <span class="rating-number">${product.rating}</span>
                            <span class="sold-count">(ขายแล้ว ${product.soldCount})</span>
                        </div>
                        <div class="product-meta">
                            <div class="price-group">
                                <span class="product-price">${Utils.formatPrice(product.price)}</span>
                                ${originalPriceHTML}
                                <div class="product-points">
                                    <span class="points-icon"></span>
                                    <span>รับ ${product.points} แต้ม</span>
                                </div>
                            </div>
                            <button class="add-to-cart-btn" data-product-id="${product.id}" 
                                    ${!product.inStock ? 'disabled' : ''}>
                                ${product.inStock ? '+' : '✕'}
                            </button>
                        </div>
                        <div class="health-tags">
                            ${product.tags.map(tag => `<span class="health-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        },

        getBrandName(brandId) {
            const brandNames = {
                'brand-a': 'Healthy Choice',
                'brand-b': 'Pure Food',
                'brand-c': 'Organic Life'
            };
            return brandNames[brandId] || 'Unknown Brand';
        },

        showEmptyState() {
            DOM.productsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3 class="empty-title">ไม่พบสินค้าที่ค้นหา</h3>
                    <p class="empty-text">ลองปรับเงื่อนไขการค้นหาหรือกรองสินค้าใหม่</p>
                    <button class="clear-filters-btn" onclick="window.ProductListingApp.FilterManager.clearAllFilters()">
                        ล้างตัวกรองทั้งหมด
                    </button>
                </div>
            `;
        },

        updateLoadMoreButton() {
            if (!DOM.loadMoreBtn) return;

            const hasMore = AppState.displayedProducts.length < AppState.filteredProducts.length;
            
            if (hasMore) {
                DOM.loadMoreBtn.style.display = 'block';
                DOM.loadMoreBtn.textContent = `ดูเพิ่มเติม (เหลือ ${AppState.filteredProducts.length - AppState.displayedProducts.length} รายการ)`;
            } else {
                DOM.loadMoreBtn.style.display = 'none';
            }
        },

        animateNewProducts(count, append) {
            const cards = DOM.productsGrid.querySelectorAll('.product-card');
            const startIndex = append ? cards.length - count : 0;
            
            for (let i = startIndex; i < cards.length; i++) {
                cards[i].style.animationDelay = `${(i - startIndex) * 0.1}s`;
                cards[i].classList.add('fade-in-up');
            }
        },

        loadMoreProducts() {
            AppState.currentPage++;
            this.renderProducts(true);
            
            Utils.trackEvent('load_more_products', { 
                page: AppState.currentPage,
                totalDisplayed: AppState.displayedProducts.length
            });
        },

        handleAddToCart(event) {
            const productCard = event.target.closest('.product-card');
            if (!productCard) return;

            const productId = parseInt(productCard.dataset.productId);
            const button = event.target.closest('.add-to-cart-btn');

            // Check if product is in stock
            const product = AppState.allProducts.find(p => p.id === productId);
            if (!product?.inStock) {
                Utils.showMessage('สินค้าหมด กรุณาเลือกสินค้าอื่น', 'warning');
                return;
            }

            // Show loading state
            button.disabled = true;
            button.innerHTML = '⏳';
            button.classList.add('loading');

            // Create flying animation
            this.createFlyToCartAnimation(button);

            // Simulate API call
            setTimeout(() => {
                const success = CartManager.addToCart(productId);

                if (success) {
                    // Success state
                    button.innerHTML = '✓';
                    button.classList.remove('loading');
                    button.classList.add('success');

                    setTimeout(() => {
                        button.innerHTML = '+';
                        button.classList.remove('success');
                        button.disabled = false;
                    }, 1000);
                } else {
                    // Error state
                    button.innerHTML = '❌';
                    button.classList.remove('loading');
                    button.classList.add('error');

                    setTimeout(() => {
                        button.innerHTML = '+';
                        button.classList.remove('error');
                        button.disabled = false;
                    }, 1000);
                }
            }, 500);
        },

        createFlyToCartAnimation(button) {
            if (!DOM.cartBtn) return;

            const flyingItem = document.createElement('div');
            flyingItem.className = 'flying-cart-item';
            flyingItem.innerHTML = '+1';

            const buttonRect = button.getBoundingClientRect();
            const cartRect = DOM.cartBtn.getBoundingClientRect();

            flyingItem.style.cssText = `
                position: fixed;
                left: ${buttonRect.left + buttonRect.width/2}px;
                top: ${buttonRect.top + buttonRect.height/2}px;
                background: var(--primary-green);
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                z-index: 1000;
                pointer-events: none;
                transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            `;

            document.body.appendChild(flyingItem);

            requestAnimationFrame(() => {
                flyingItem.style.left = `${cartRect.left + cartRect.width/2}px`;
                flyingItem.style.top = `${cartRect.top + cartRect.height/2}px`;
                flyingItem.style.transform = 'scale(0.1)';
                flyingItem.style.opacity = '0';
            });

            setTimeout(() => {
                if (flyingItem.parentNode) {
                    flyingItem.parentNode.removeChild(flyingItem);
                }
            }, 800);
        },

        handleProductClick(productCard) {
            const productId = productCard.dataset.productId;
            
            Utils.showLoading('กำลังโหลดรายละเอียดสินค้า...');
            
            Utils.trackEvent('product_view', { productId: parseInt(productId) });

            setTimeout(() => {
                Utils.hideLoading();
                window.location.href = `product-detail.html?id=${productId}`;
            }, 500);
        }
    };

    // --- NAVIGATION MANAGEMENT ---
    const NavigationManager = {
        init() {
            this.setupHeaderNavigation();
            this.setupBottomNavigation();
            this.setupModalNavigation();
        },

        setupHeaderNavigation() {
            // Back button
            if (DOM.backBtn) {
                DOM.backBtn.addEventListener('click', () => {
                    this.goBack();
                });
            }

            // Cart button
            if (DOM.cartBtn) {
                DOM.cartBtn.addEventListener('click', () => {
                    window.location.href = '../../cart/cart.html';
                });
            }

            // Search button - now focuses on the search input
            if (DOM.searchBtn && DOM.searchInput) {
                DOM.searchBtn.addEventListener('click', () => {
                    DOM.searchInput.focus();
                });
            }

            // Debounced search handler for live search
            const debouncedSearch = Utils.debounce(() => {
                const searchTerm = DOM.searchInput.value.trim();
                if (AppState.searchTerm !== searchTerm) {
                    AppState.searchTerm = searchTerm;
                    FilterManager.applyFilters();
                    Utils.updateUrl({ search: AppState.searchTerm || null });
                    if (DOM.searchClearBtn) {
                        DOM.searchClearBtn.style.display = searchTerm ? 'block' : 'none';
                    }
                }
            }, 300);

            if (DOM.searchInput) {
                DOM.searchInput.addEventListener('input', debouncedSearch);
            }

            if (DOM.searchClearBtn) {
                DOM.searchClearBtn.addEventListener('click', () => {
                    DOM.searchInput.value = '';
                    DOM.searchInput.dispatchEvent(new Event('input')); // Trigger search to clear results
                });
            }
        },

        setupBottomNavigation() {
            DOM.navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const navType = item.dataset.nav;
                    this.handleBottomNavigation(navType, item);
                });
            });
        },

        setupModalNavigation() {
            // Close modals
            if (DOM.closeFilterModal) {
                DOM.closeFilterModal.addEventListener('click', () => {
                    FilterManager.hideAdvancedFiltersModal();
                });
            }

            // Click outside to close modals
            [DOM.sortModal, DOM.filterModal].forEach(modal => {
                if (modal) {
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            modal.style.display = 'none';
                            document.body.style.overflow = 'auto';
                        }
                    });
                }
            });
        },

        goBack() {
            if (document.referrer && document.referrer.startsWith(window.location.origin)) {
                history.back();
            } else {
                window.location.href = 'index.html';
            }
        },

        handleBottomNavigation(navType, navItem) {
            // Update active state
            DOM.navItems.forEach(item => item.classList.remove('active'));
            navItem.classList.add('active');

            switch (navType) {
                case 'home':
                    window.location.href = 'index.html';
                    break;
                case 'categories':
                    // Already on categories page
                    break;
                case 'member':
                    window.location.href = 'member-dashboard.html';
                    break;
                case 'account':
                    window.location.href = 'user-profile.html';
                    break;
            }

            Utils.trackEvent('bottom_nav_click', { destination: navType });
        }
    };

    // --- INITIALIZATION ---
    const init = async () => {
        try {
            console.log('🚀 Initializing Product Listing Page...');

            // Show loading
            Utils.showLoading('กำลังโหลดสินค้า...');

            // Load products data
            AppState.allProducts = MOCK_PRODUCTS;
            AppState.filteredProducts = [...AppState.allProducts];

            // Initialize all managers
            CartManager.updateCartCount();
            FilterManager.init();
            SortManager.init();
            ProductManager.init();
            NavigationManager.init();

            // Apply initial filters and sorting
            FilterManager.applyFilters();
            SortManager.applySort();

            // Setup performance optimizations
            setupPerformanceOptimizations();

            // Hide loading
            Utils.hideLoading();

            console.log('✅ Product Listing Page Ready!');

            // Show welcome message
            setTimeout(() => {
                if (AppState.searchTerm) {
                    Utils.showMessage(`ผลการค้นหา: "${AppState.searchTerm}"`, 'info');
                }
            }, 500);

        } catch (error) {
            console.error('❌ Error initializing product listing page:', error);
            Utils.hideLoading();
            Utils.showMessage('เกิดข้อผิดพลาดในการโหลดหน้า กรุณาลองใหม่อีกครั้ง', 'error');
        }
    };

    // --- PERFORMANCE OPTIMIZATIONS ---
    const setupPerformanceOptimizations = () => {
        // Lazy loading for product images
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        // Load actual image here if using real images
                        observer.unobserve(img);
                    }
                });
            });

            // Observe product images
            document.querySelectorAll('.product-image').forEach(img => {
                observer.observe(img);
            });
        }

        // Infinite scroll alternative to load more
        setupInfiniteScroll();
    };

    const setupInfiniteScroll = () => {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollPosition = window.innerHeight + window.scrollY;
                    const documentHeight = document.documentElement.offsetHeight;
                    
                    // Load more when 200px from bottom
                    if (scrollPosition >= documentHeight - 200) {
                        if (AppState.displayedProducts.length < AppState.filteredProducts.length) {
                            ProductManager.loadMoreProducts();
                        }
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        });
    };

    // Add custom styles
    const addCustomStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            .fade-in-up {
                animation: fadeInUp 0.6s ease-out forwards;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .out-of-stock-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 14px;
                border-radius: 16px 16px 0 0;
            }
            
            .clear-filters-btn {
                background: var(--primary-green);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 24px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 16px;
                transition: all 0.3s ease;
            }
            
            .clear-filters-btn:hover {
                background: var(--success);
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    };

    // Add custom styles
    addCustomStyles();

    // Start the application
    init();

    // Global error handling
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        Utils.showMessage('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
    });

    // Expose managers for external access
    window.ProductListingApp = {
        FilterManager,
        SortManager,
        ProductManager,
        CartManager,
        Utils
    };

    console.log('📂 Product Listing Script Loaded Successfully!');
});