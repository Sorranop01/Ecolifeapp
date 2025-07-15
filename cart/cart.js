document.addEventListener('DOMContentLoaded', () => {
    const CartApp = {
        state: {
            cart: [],
            selectedItemIds: [],
            itemToDelete: null,
            user: {
                points: 1250,
                coupons: [
                    { code: 'SAVE10', type: 'percent', value: 10, description: 'ลด 10% ทั้งตะกร้า' },
                    { code: 'FRESH50', type: 'fixed', value: 50, description: 'ลดทันที 50 บาท' },
                ]
            },
            appliedCoupon: null,
            pointsUsed: 0,
            addonsConfig: {
                'ไข่ดาว': 10,
                'ไข่เจียว': 15,
            }
        },

        config: {
            pointsConversionRate: 1, // 1 point = 1 THB
        },

        // A small DB to get extra details not stored in the cart (like images)
        productDetailsDB: {
            '1': { image: '🍱', tags: ['ต่ำแคล', 'โปรตีนสูง'], brand: 'Healthy Choice' },
            '2': { image: '🥗', tags: ['ออร์แกนิค', 'ไฟเบอร์สูง'], brand: 'Pure Food' },
            '3': { image: '🍪', tags: ['โปรตีนสูง', 'พลังงาน'], brand: 'Organic Life' },
            '4': { image: '🥤', tags: ['วิตามินสูง', 'ไม่มีน้ำตาล'], brand: 'Healthy Choice' },
            'default': { image: '📦', tags: [], brand: 'EcoLife' }
        },

        dom: {
            container: document.querySelector('.container'),
            cartContent: document.getElementById('cartContent'),
            emptyCartView: document.getElementById('emptyCart'),
            summarySection: document.getElementById('summarySection'),
            promoSection: document.getElementById('promoSection'),
            checkoutBar: document.getElementById('checkoutBar'),
            
            // Promo Section
            couponRow: document.getElementById('couponRow'),
            pointsRow: document.getElementById('pointsRow'),
            couponStatus: document.getElementById('couponStatus'),
            availablePoints: document.getElementById('availablePoints'),

            // Summary elements
            totalItems: document.getElementById('totalItems'),
            subtotal: document.getElementById('subtotal'),
            discountRow: document.getElementById('discountRow'),
            discountAmount: document.getElementById('discountAmount'),
            addonsRow: document.getElementById('addonsRow'),
            addonsTotal: document.getElementById('addonsTotal'),
            couponDiscountRow: document.getElementById('couponDiscountRow'),
            couponDiscount: document.getElementById('couponDiscount'),
            pointsDiscountRow: document.getElementById('pointsDiscountRow'),
            pointsDiscount: document.getElementById('pointsDiscount'),
            finalTotal: document.getElementById('finalTotal'),
            earnedPoints: document.getElementById('earnedPoints'),

            // Checkout bar elements
            checkoutTotal: document.getElementById('checkoutTotal'),
            savedAmount: document.getElementById('savedAmount'),
            checkoutItemCount: document.getElementById('checkoutItemCount'),
            checkoutBtn: document.getElementById('checkoutBtn'),
            selectAllBottom: document.getElementById('selectAllBottom'),

            // Modals
            deleteModal: document.getElementById('deleteModal'),
            clearCartModal: document.getElementById('clearCartModal'),
            couponModal: document.getElementById('couponModal'),
            pointsModal: document.getElementById('pointsModal'),

            // Coupon Modal elements
            couponInput: document.getElementById('couponInput'),
            applyCouponBtn: document.querySelector('#couponModal .apply-coupon-btn'),
            couponList: document.getElementById('couponList'),

            // Points Modal elements
            totalPoints: document.getElementById('totalPoints'),
            pointsInput: document.getElementById('pointsInput'),
            useAllPointsBtn: document.querySelector('#pointsModal .use-all-points-btn'),
            pointsSlider: document.getElementById('pointsSlider'),
            usedPointsPreview: document.getElementById('usedPointsPreview'),
            pointsDiscountPreview: document.getElementById('pointsDiscountPreview'),
            remainingPointsPreview: document.getElementById('remainingPointsPreview'),

            // Toast
            toast: document.getElementById('toast'),
            toastIcon: document.getElementById('toastIcon'),
            toastMessage: document.getElementById('toastMessage'),
        },

        init() {
            this.loadCart();
            this.renderPage();
            this.setupEventListeners();
            this.renderCoupons();
            console.log('Cart App Initialized');
        },

        loadCart() {
            try {
                const savedCart = localStorage.getItem('ecolife_cart') || '[]';
                this.state.cart = JSON.parse(savedCart);
                // By default, all items are selected
                this.state.selectedItemIds = this.state.cart.map(item => item.id);
            } catch (e) {
                console.error("Error loading cart from localStorage:", e);
                this.state.cart = [];
                this.state.selectedItemIds = [];
            }
        },

        saveCart() {
            localStorage.setItem('ecolife_cart', JSON.stringify(this.state.cart));
        },

        renderPage() {
            const hasItems = this.state.cart.length > 0;
            
            this.dom.emptyCartView.style.display = hasItems ? 'none' : 'flex';
            this.dom.cartContent.style.display = hasItems ? 'block' : 'none';
            this.dom.summarySection.style.display = hasItems ? 'block' : 'none';
            this.dom.promoSection.style.display = hasItems ? 'block' : 'none';
            this.dom.checkoutBar.style.display = hasItems ? 'block' : 'none';
            const clearAllBtn = document.getElementById('clearAllBtn');
            if (clearAllBtn) clearAllBtn.style.display = hasItems ? 'flex' : 'none';
            
            if (hasItems) {
                this.renderItems();
                this.updateSummary();
                this.dom.availablePoints.textContent = this.state.user.points.toLocaleString();
            }
        },

        renderItems() {
            const groupedByBrand = this.state.cart.reduce((acc, item) => {
                const details = this.productDetailsDB[item.id] || this.productDetailsDB.default;
                const brand = details.brand;
                if (!acc[brand]) {
                    acc[brand] = [];
                }
                acc[brand].push(item);
                return acc;
            }, {});

            let html = '';
            for (const brand in groupedByBrand) {
                html += this.renderBrandSection(brand, groupedByBrand[brand]);
            }
            this.dom.cartContent.innerHTML = html;
        },

        renderBrandSection(brand, items) {
            const allSelected = items.every(item => this.state.selectedItemIds.includes(item.id));
            return `
                <div class="cart-section" data-brand="${brand}">
                    <div class="section-header">
                        <div class="brand-title">${brand}</div>
                        <div class="select-all" data-brand="${brand}">
                            <div class="checkbox ${allSelected ? 'checked' : ''}"></div>
                            <span>เลือกทั้งหมด</span>
                        </div>
                    </div>
                    ${items.map(item => this.renderItem(item)).join('')}
                </div>
            `;
        },

        renderItem(item) {
            const details = this.productDetailsDB[item.id] || this.productDetailsDB.default;
            const isSelected = this.state.selectedItemIds.includes(item.id);
            const hasDiscount = item.originalPrice && item.originalPrice > item.price;

            // --- START: Spiciness Options Logic ---
            const isCustomizable = (details.brand === 'Healthy Choice' || details.brand === 'Pure Food');
            let optionsHTML = ''; // Start with empty options
            if (isCustomizable) {
                const options = item.options || { spiciness: 'medium', addon: 'none' };

                optionsHTML = `
                    <div class="item-options">
                        <div class="option-group">
                            <label class="option-label">🌶️ ระดับความเผ็ด:</label>
                            <select class="spiciness-select">
                                <option value="none" ${options.spiciness === 'none' ? 'selected' : ''}>ไม่เผ็ด</option>
                                <option value="less" ${options.spiciness === 'less' ? 'selected' : ''}>เผ็ดน้อย</option>
                                <option value="medium" ${options.spiciness === 'medium' ? 'selected' : ''}>เผ็ดกลาง</option>
                                <option value="more" ${options.spiciness === 'more' ? 'selected' : ''}>เผ็ดมาก</option>
                            </select>
                        </div>
                        <div class="option-group">
                            <label class="option-label">🍳 เพิ่มพิเศษ:</label>
                            <select class="addon-select">
                                <option value="none" ${options.addon === 'none' ? 'selected' : ''}>ไม่เลือก</option>
                                <option value="ไข่ดาว" ${options.addon === 'ไข่ดาว' ? 'selected' : ''}>ไข่ดาว (+฿${this.state.addonsConfig['ไข่ดาว']})</option>
                                <option value="ไข่เจียว" ${options.addon === 'ไข่เจียว' ? 'selected' : ''}>ไข่เจียว (+฿${this.state.addonsConfig['ไข่เจียว']})</option>
                            </select>
                        </div>
                    </div>
                `;
            }
            // --- END: Spiciness Options Logic ---

            return `
                <div class="cart-item" data-id="${item.id}">
                    <div class="item-checkbox">
                        <div class="checkbox ${isSelected ? 'checked' : ''}"></div>
                    </div>
                    <div class="item-image">${details.image}</div>
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-bottom">
                            <div class="item-price-group">
                                <div class="item-price">฿${item.price.toFixed(2)}</div>
                                ${hasDiscount ? `<div class="item-original-price">฿${item.originalPrice.toFixed(2)}</div>` : ''}
                            </div>
                            <div class="quantity-control">
                                <button class="qty-btn" data-action="decrease" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                                <span class="qty-value">${item.quantity}</span>
                                <button class="qty-btn" data-action="increase">+</button>
                            </div>
                        </div>
                        ${optionsHTML} 
                    </div>
                    <button class="delete-btn" title="ลบสินค้า">🗑️</button>
                </div>
            `;
        },

        calculateSummary() {
            const selectedItems = this.state.cart.filter(item => this.state.selectedItemIds.includes(item.id));

            let subtotal = 0;
            let totalOriginalPrice = 0;
            let totalItems = 0;
            let addonsTotal = 0;

            selectedItems.forEach(item => {
                const originalPrice = item.originalPrice || item.price;
                totalOriginalPrice += originalPrice * item.quantity;
                subtotal += item.price * item.quantity;
                totalItems += item.quantity;

                if (item.options?.addon && item.options.addon !== 'none') {
                    const addonName = item.options.addon;
                    addonsTotal += (this.state.addonsConfig[addonName] || 0) * item.quantity;
                }
            });

            const itemDiscount = totalOriginalPrice - subtotal;

            const pointsToUse = Math.min(this.state.pointsUsed, this.state.user.points);
            const pointsDiscountValue = Math.min(pointsToUse * this.config.pointsConversionRate, subtotal + addonsTotal);

            let couponDiscountValue = 0;
            const subtotalAfterPoints = subtotal + addonsTotal - pointsDiscountValue;
            if (this.state.appliedCoupon && subtotalAfterPoints > 0) {
                const coupon = this.state.appliedCoupon;
                if (coupon.type === 'fixed') {
                    couponDiscountValue = Math.min(coupon.value, subtotalAfterPoints);
                } else if (coupon.type === 'percent') {
                    couponDiscountValue = (subtotalAfterPoints * coupon.value) / 100;
                }
            }

            const finalTotal = Math.max(0, subtotal + addonsTotal - pointsDiscountValue - couponDiscountValue);
            const totalSaved = itemDiscount + pointsDiscountValue + couponDiscountValue;
            const earnedPoints = Math.floor(finalTotal);

            return {
                totalItems, totalOriginalPrice, itemDiscount, addonsTotal,
                couponDiscountValue, pointsDiscountValue, finalTotal, totalSaved, earnedPoints
            };
        },

        updateSummary() {
            const summary = this.calculateSummary();

            // Update summary section
            this.dom.totalItems.textContent = summary.totalItems;
            this.dom.subtotal.textContent = `฿${summary.totalOriginalPrice.toFixed(2)}`;
            
            this.dom.discountRow.style.display = summary.itemDiscount > 0 ? 'flex' : 'none';
            this.dom.discountAmount.textContent = `-฿${summary.itemDiscount.toFixed(2)}`;

            this.dom.addonsRow.style.display = summary.addonsTotal > 0 ? 'flex' : 'none';
            this.dom.addonsTotal.textContent = `+฿${summary.addonsTotal.toFixed(2)}`;

            this.dom.couponDiscountRow.style.display = summary.couponDiscountValue > 0 ? 'flex' : 'none';
            this.dom.couponDiscount.textContent = `-฿${summary.couponDiscountValue.toFixed(2)}`;

            this.dom.pointsDiscountRow.style.display = summary.pointsDiscountValue > 0 ? 'flex' : 'none';
            this.dom.pointsDiscount.textContent = `-฿${summary.pointsDiscountValue.toFixed(2)}`;

            this.dom.finalTotal.textContent = `฿${summary.finalTotal.toFixed(2)}`;
            this.dom.earnedPoints.textContent = `+${summary.earnedPoints.toLocaleString()} แต้ม`;

            // Update checkout bar
            this.dom.checkoutTotal.textContent = `฿${summary.finalTotal.toFixed(2)}`;
            this.dom.savedAmount.textContent = `ประหยัด ฿${summary.totalSaved.toFixed(2)}`;
            this.dom.checkoutItemCount.textContent = `(${summary.totalItems})`;
            this.dom.checkoutBtn.disabled = this.state.selectedItemIds.length === 0;

            // Update "Select All" checkbox in checkout bar
            if (this.dom.selectAllBottom) {
                const allItemIds = this.state.cart.map(item => item.id);
                const allSelected = allItemIds.length > 0 && allItemIds.every(id => this.state.selectedItemIds.includes(id));
                this.dom.selectAllBottom.classList.toggle('checked', allSelected);
            }
        },

        setupEventListeners() {
            // Centralized event listener for the entire container
            this.dom.container.addEventListener('click', e => {
                const target = e.target;
                const closest = (selector) => target.closest(selector);

                const qtyBtn = closest('.qty-btn');
                const deleteBtn = closest('.delete-btn');
                const itemCheckbox = closest('.item-checkbox');
                const brandSelectAll = closest('.select-all');

                if (qtyBtn) this.handleQuantityClick(qtyBtn);
                else if (deleteBtn) this.handleDeleteClick(deleteBtn);
                else if (itemCheckbox) this.handleItemCheckboxClick(itemCheckbox);
                else if (brandSelectAll) this.handleBrandSelectAllClick(brandSelectAll);
                else if (closest('#backButton')) window.history.back();
                else if (closest('#shopNowButton')) window.location.href = '../Product/listing/product-listing.html';
                else if (closest('#clearAllBtn')) this.openModal('clearCartModal');
                else if (closest('#couponRow')) this.openModal('couponModal');
                else if (closest('#pointsRow')) this.openModal('pointsModal');
                else if (closest('.select-all-bottom')) this.toggleSelectAll();
                else if (closest('#checkoutBtn')) this.handleCheckout();
            });

            // Listener for input/select changes
            this.dom.container.addEventListener('change', e => {
                const target = e.target;
                if (target.matches('.spiciness-select, .addon-select')) {
                    this.handleItemOptionChange(target);
                }
            });

            // Modal Listeners
            this.dom.deleteModal.querySelector('.modal-cancel').addEventListener('click', () => this.closeModal('deleteModal'));
            this.dom.deleteModal.querySelector('.modal-close')?.addEventListener('click', () => this.closeModal('deleteModal'));
            this.dom.deleteModal.querySelector('.modal-delete').addEventListener('click', () => this.confirmDelete());

            this.dom.clearCartModal.querySelector('.modal-cancel').addEventListener('click', () => this.closeModal('clearCartModal'));
            this.dom.clearCartModal.querySelector('.modal-close').addEventListener('click', () => this.closeModal('clearCartModal'));
            this.dom.clearCartModal.querySelector('.modal-delete').addEventListener('click', () => this.confirmClearCart());
            
            this.dom.couponModal.querySelector('.modal-close').addEventListener('click', () => this.closeModal('couponModal'));
            this.dom.applyCouponBtn.addEventListener('click', () => this.applyCoupon(this.dom.couponInput.value));
            this.dom.couponList.addEventListener('click', e => {
                const couponItem = e.target.closest('.coupon-item');
                if (couponItem) this.applyCoupon(couponItem.dataset.code);
            });

            const pointsModal = this.dom.pointsModal;
            pointsModal.querySelector('.modal-close').addEventListener('click', () => this.closeModal('pointsModal'));
            pointsModal.querySelector('.modal-cancel').addEventListener('click', () => this.closeModal('pointsModal'));
            pointsModal.querySelector('.modal-apply').addEventListener('click', () => this.applyPoints());
            this.dom.useAllPointsBtn.addEventListener('click', () => this.useAllPoints());
            this.dom.pointsInput.addEventListener('input', () => this.updatePointsModalUI(parseInt(this.dom.pointsInput.value) || 0));
            this.dom.pointsSlider.addEventListener('input', () => this.updatePointsModalUI(parseInt(this.dom.pointsSlider.value) || 0));
        },

        handleQuantityClick(button) {
            const itemEl = button.closest('.cart-item');
            if (!itemEl) return;
            const productId = itemEl.dataset.id;
            const action = button.dataset.action;
            const item = this.state.cart.find(i => i.id === productId);
            if (!item) return;

            if (action === 'increase') {
                item.quantity++;
            } else if (action === 'decrease' && item.quantity > 1) {
                item.quantity--;
            } else {
                return;
            }

            this.saveCart();
            itemEl.querySelector('.qty-value').textContent = item.quantity;
            itemEl.querySelector('.qty-btn[data-action="decrease"]').disabled = item.quantity <= 1;
            this.updateSummary();
        },

        handleItemOptionChange(target) {
            const itemEl = target.closest('.cart-item');
            if (!itemEl) return;

            const itemId = itemEl.dataset.id;
            const item = this.state.cart.find(i => i.id === itemId);
            if (!item) return;

            // Initialize options if they don't exist
            if (!item.options) {
                item.options = { spiciness: 'medium', addon: 'none' };
            }

            let summaryNeedsUpdate = false;

            if (target.matches('.spiciness-select')) {
                item.options.spiciness = target.value;
            } else if (target.matches('.addon-select')) {
                item.options.addon = target.value;
                summaryNeedsUpdate = true;
            }
            
            this.saveCart();
            if (summaryNeedsUpdate) {
                this.updateSummary();
            }
        },

        handleDeleteClick(button) {
            const itemEl = button.closest('.cart-item');
            if (!itemEl) return;
            this.state.itemToDelete = itemEl.dataset.id;
            this.openModal('deleteModal');
        },

        handleItemCheckboxClick(checkboxWrapper) {
            const itemEl = checkboxWrapper.closest('.cart-item');
            if (!itemEl) return;
            this.toggleItemSelection(itemEl.dataset.id);
        },

        handleBrandSelectAllClick(selectAllWrapper) {
            const brand = selectAllWrapper.closest('.cart-section').dataset.brand;
            this.toggleBrandSelection(brand);
        },

        confirmClearCart() {
            this.state.cart = [];
            this.state.selectedItemIds = [];
            this.state.appliedCoupon = null;
            this.state.pointsUsed = 0;
            this.saveCart();
            this.renderPage();
            this.closeModal('clearCartModal');
            this.showToast('ล้างตะกร้าสินค้าทั้งหมดแล้ว', 'success');
        },

        confirmDelete() {
            if (this.state.itemToDelete) {
                const productId = this.state.itemToDelete;
                this.state.cart = this.state.cart.filter(item => item.id !== productId);
                this.state.selectedItemIds = this.state.selectedItemIds.filter(id => id !== productId);
                this.saveCart();
                this.renderPage(); // Full re-render is acceptable after deletion
                this.closeModal('deleteModal');
                this.state.itemToDelete = null;
            }
        },

        toggleItemSelection(productId) {
            const index = this.state.selectedItemIds.indexOf(productId);
            if (index > -1) {
                this.state.selectedItemIds.splice(index, 1); // Deselect
            } else {
                this.state.selectedItemIds.push(productId); // Select
            }
            
            // Direct DOM update
            const itemEl = this.dom.cartContent.querySelector(`.cart-item[data-id="${productId}"]`);
            itemEl.querySelector('.checkbox').classList.toggle('checked');
            
            const brand = (this.productDetailsDB[productId] || this.productDetailsDB.default).brand;
            this.updateBrandSelectAllState(brand);
            this.updateSummary();
        },

        toggleBrandSelection(brand) {
            const brandItems = this.state.cart.filter(item => {
                const details = this.productDetailsDB[item.id] || this.productDetailsDB.default;
                return details.brand === brand;
            });
            const brandItemIds = brandItems.map(item => item.id);
            const allSelected = brandItemIds.every(id => this.state.selectedItemIds.includes(id));

            if (allSelected) {
                // Deselect all from this brand
                this.state.selectedItemIds = this.state.selectedItemIds.filter(id => !brandItemIds.includes(id));
            } else {
                // Select all from this brand
                brandItemIds.forEach(id => {
                    if (!this.state.selectedItemIds.includes(id)) {
                        this.state.selectedItemIds.push(id);
                    }
                });
            }

            // Direct DOM update
            brandItemIds.forEach(id => {
                const itemEl = this.dom.cartContent.querySelector(`.cart-item[data-id="${id}"]`);
                itemEl.querySelector('.checkbox').classList.toggle('checked', !allSelected);
            });
            this.updateBrandSelectAllState(brand);
            this.updateSummary();
        },

        toggleSelectAll() {
            const allItemIds = this.state.cart.map(item => item.id);
            const allCurrentlySelected = allItemIds.length > 0 && allItemIds.every(id => this.state.selectedItemIds.includes(id));

            if (allCurrentlySelected) {
                // If everything is selected, deselect all
                this.state.selectedItemIds = [];
            } else {
                // Otherwise, select all
                this.state.selectedItemIds = allItemIds;
            }

            // Direct DOM update
            this.dom.cartContent.querySelectorAll('.cart-item .checkbox').forEach(box => {
                box.classList.toggle('checked', !allCurrentlySelected);
            });
            this.dom.cartContent.querySelectorAll('.select-all .checkbox').forEach(box => {
                box.classList.toggle('checked', !allCurrentlySelected);
            });

            this.updateSummary();
        },

        openModal(modalId) {
            const modal = this.dom[modalId] || document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                if (modalId === 'pointsModal') {
                    const maxPoints = this.state.user.points;
                    this.dom.totalPoints.textContent = `${maxPoints.toLocaleString()} แต้ม`;
                    this.dom.pointsSlider.max = maxPoints;
                    this.dom.pointsInput.max = maxPoints;
                    this.dom.pointsInput.value = this.state.pointsUsed;
                    this.dom.pointsSlider.value = this.state.pointsUsed;
                    this.updatePointsModalUI(this.state.pointsUsed);
                }
            }
        },

        closeModal(modalId) {
            const modal = this.dom[modalId] || document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
            }
        },

        updateBrandSelectAllState(brand) {
            const brandSection = this.dom.cartContent.querySelector(`.cart-section[data-brand="${brand}"]`);
            if (!brandSection) return;

            const brandItems = this.state.cart.filter(item => (this.productDetailsDB[item.id] || this.productDetailsDB.default).brand === brand);
            const brandItemIds = brandItems.map(item => item.id);
            const allSelected = brandItemIds.length > 0 && brandItemIds.every(id => this.state.selectedItemIds.includes(id));

            const brandCheckbox = brandSection.querySelector('.select-all .checkbox');
            if (brandCheckbox) {
                brandCheckbox.classList.toggle('checked', allSelected);
            }
        },

        renderCoupons() {
            const coupons = this.state.user.coupons;
            if (!this.dom.couponList) return;
            this.dom.couponList.innerHTML = coupons.map(coupon => `
                <div class="coupon-item" data-code="${coupon.code}">
                    <div class="coupon-info">
                        <div class="coupon-title">${coupon.code}</div>
                        <div class="coupon-desc">${coupon.description}</div>
                    </div>
                    <div class="coupon-value">${coupon.type === 'fixed' ? `฿${coupon.value}` : `${coupon.value}%`}</div>
                </div>
            `).join('');
        },

        applyCoupon(code) {
            const coupon = this.state.user.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
            if (coupon) {
                this.state.appliedCoupon = coupon;
                this.dom.couponStatus.textContent = `ใช้โค้ด: ${coupon.code}`;
                this.dom.couponStatus.style.color = 'var(--success)';
                this.showToast(`ใช้คูปอง ${coupon.code} สำเร็จ`, 'success');
            } else {
                this.state.appliedCoupon = null;
                this.dom.couponStatus.textContent = 'เลือกหรือใส่โค้ด';
                this.dom.couponStatus.style.color = 'var(--medium-gray)';
                this.showToast('โค้ดส่วนลดไม่ถูกต้อง', 'error');
            }
            this.updateSummary();
            this.closeModal('couponModal');
        },

        useAllPoints() {
            const maxPoints = this.state.user.points;
            this.dom.pointsInput.value = maxPoints;
            this.dom.pointsSlider.value = maxPoints;
            this.updatePointsModalUI(maxPoints);
        },

        handleCheckout() {
            if (this.state.selectedItemIds.length === 0) {
                return this.showToast('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ', 'error');
            }
            
            // คำนวณยอดรวมจาก state โดยตรงเพื่อความแม่นยำ
            const summary = this.calculateSummary();

            const checkoutData = {
                items: this.state.cart.filter(item => this.state.selectedItemIds.includes(item.id)),
                discounts: {
                    coupon: this.state.appliedCoupon,
                    pointsUsed: this.state.pointsUsed,
                },
                summary: {
                    finalTotal: summary.finalTotal,
                }
            };
            
            localStorage.setItem('ecolife_checkout_data', JSON.stringify(checkoutData));
            window.location.href = '../checkout/checkout.html';
        },

        updatePointsModalUI(points) {
            const pointsToUse = Math.max(0, Math.min(points, this.state.user.points));
            const discount = pointsToUse * this.config.pointsConversionRate;
            const remaining = this.state.user.points - pointsToUse;

            this.dom.usedPointsPreview.textContent = `${pointsToUse.toLocaleString()} แต้ม`;
            this.dom.pointsDiscountPreview.textContent = `฿${discount.toFixed(2)}`;
            this.dom.remainingPointsPreview.textContent = `${remaining.toLocaleString()} แต้ม`;
        },

        applyPoints() {
            this.state.pointsUsed = parseInt(this.dom.pointsInput.value) || 0;
            this.updateSummary();
            this.closeModal('pointsModal');
            if (this.state.pointsUsed > 0) {
                this.showToast(`ใช้ ${this.state.pointsUsed.toLocaleString()} แต้ม สำเร็จ`, 'success');
            }
        },

        showToast(message, type = 'success') {
            this.dom.toastMessage.textContent = message;
            this.dom.toast.className = `toast show ${type}`;
            
            const icons = {
                success: '✅',
                error: '❌',
                info: 'ℹ️'
            };
            this.dom.toastIcon.textContent = icons[type] || '✅';

            setTimeout(() => this.dom.toast.classList.remove('show'), 3000);
        },
    };

    CartApp.init();
});
