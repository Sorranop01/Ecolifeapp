document.addEventListener('DOMContentLoaded', () => {
    const CheckoutApp = {
        state: {
            checkoutData: null,
            selectedAddress: null, // Will be a dynamic ID
            selectedPayment: 'card',
            user: {
                addresses: [] // To be loaded from localStorage
            },
            additionalOptions: {
                wantsCutlery: true, // Default from HTML 'checked'
                deliveryNote: ''
            },
        },

        dom: {
            // Summary elements
            itemCount: document.getElementById('itemCount'),
            itemsTotal: document.getElementById('itemsTotal'),
            itemDiscount: document.getElementById('itemDiscount'),
            finalTotal: document.getElementById('finalTotal'),
            pointsEarned: document.getElementById('pointsEarned'),
            
            // Bottom bar elements
            checkoutAmount: document.getElementById('checkoutAmount'),
            checkoutButton: document.getElementById('checkoutButton'),
            
            // Interactive sections
            addressesContainer: document.getElementById('addressesContainer'),
            paymentOptions: document.getElementById('paymentOptions'),
            backButton: document.getElementById('backButton'),
            addAddressButton: document.getElementById('addAddressButton'),
            // Additional Options
            cutleryToggle: document.getElementById('cutleryToggle'),
            deliveryNote: document.getElementById('deliveryNote'),
        },

        init() {
            if (!this.loadCheckoutData()) {
                // If data loading fails, stop initialization.
                return;
            }
            this.loadUserAddresses();
            this.renderSummary();
            this.renderAddresses();
            this.setupEventListeners();
            this.handleAddressSelectionOnReturn();
            console.log('Checkout App Initialized with data:', this.state.checkoutData);
        },

        loadUserAddresses() {
            // In a real app, this would be an API call. Here we use localStorage.
            const storedAddresses = localStorage.getItem('ecolife_user_addresses');
            if (storedAddresses && JSON.parse(storedAddresses).length > 0) {
                this.state.user.addresses = JSON.parse(storedAddresses);
            } else {
                // Fallback to the hardcoded data if nothing is in storage, and save it for next time.
                this.state.user.addresses = [
                    { id: 'home', name: 'คุณสมศรี ใจดี', phone: '08X-XXX-XXXX', line: '123/45 คอนโด The Green Life ชั้น 8<br>ซ.สุขุมวิท 23 แขวงคลองเตย เขตคลองเตย<br>กรุงเทพฯ 10110', type: 'บ้าน', isDefault: true },
                    { id: 'work', name: 'คุณสมศรี ใจดี', phone: '08X-XXX-XXXX', line: '999 อาคาร ABC ชั้น 15<br>ถ.พระราม 4 แขวงคลองเตย เขตคลองเตย<br>กรุงเทพฯ 10110', type: 'ที่ทำงาน', isDefault: false }
                ];
                localStorage.setItem('ecolife_user_addresses', JSON.stringify(this.state.user.addresses));
            }

            // Find the default address to select initially
            const defaultAddress = this.state.user.addresses.find(addr => addr.isDefault);
            if (defaultAddress) {
                this.state.selectedAddress = defaultAddress.id.toString();
            } else if (this.state.user.addresses.length > 0) {
                // If no default, select the first one
                this.state.selectedAddress = this.state.user.addresses[0].id.toString();
            }
        },

        renderAddresses() {
            const container = this.dom.addressesContainer;
            if (!container) return;

            if (this.state.user.addresses.length === 0) {
                container.innerHTML = '<p class="no-address-info" style="padding: 1rem; text-align: center; color: var(--text-secondary);">ไม่มีที่อยู่บันทึกไว้ กรุณาเพิ่มที่อยู่ใหม่</p>';
                return;
            }

            container.innerHTML = this.state.user.addresses.map(addr => this.createAddressCardHTML(addr)).join('');
        },

        handleAddressSelectionOnReturn() {
            const addressIdToSelect = sessionStorage.getItem('selectAddressIdOnReturn');
            if (addressIdToSelect && this.state.user.addresses.some(addr => addr.id.toString() === addressIdToSelect)) {
                this.selectAddress(addressIdToSelect);
                // Clean up the session storage item after using it
                sessionStorage.removeItem('selectAddressIdOnReturn');
            }
        },

        loadCheckoutData() {
            const data = localStorage.getItem('ecolife_checkout_data');
            if (!data) {
                console.warn('ไม่พบข้อมูลสำหรับชำระเงิน กำลังส่งกลับไปที่หน้าตะกร้า...');
                alert('กรุณาเริ่มขั้นตอนการชำระเงินจากหน้าตะกร้าสินค้า');
                // ใช้ relative path เพื่อความเข้ากันได้ที่ดีขึ้น
                window.location.href = '../cart/cart.html';
                return false;
            }
            try {
                this.state.checkoutData = JSON.parse(data);
                return true;
            } catch (error) {
                console.error('เกิดข้อผิดพลาดในการอ่านข้อมูลชำระเงิน:', error);
                alert('ข้อมูลการชำระเงินเสียหาย กรุณาลองใหม่อีกครั้งจากหน้าตะกร้า');
                localStorage.removeItem('ecolife_checkout_data');
                window.location.href = '../cart/cart.html';
                return false;
            }
        },

        renderSummary() {
            const { items, summary } = this.state.checkoutData;

            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            const subtotal = items.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
            const itemDiscountValue = items.reduce((sum, item) => sum + ((item.originalPrice || item.price) - item.price) * item.quantity, 0);

            this.dom.itemCount.textContent = totalItems;
            this.dom.itemsTotal.textContent = `฿${subtotal.toFixed(2)}`;
            this.dom.itemDiscount.textContent = `-฿${itemDiscountValue.toFixed(2)}`;

            const finalTotalValue = summary.finalTotal;
            this.dom.finalTotal.textContent = `฿${finalTotalValue.toFixed(2)}`;
            this.dom.checkoutAmount.textContent = `฿${finalTotalValue.toFixed(2)}`;

            const earnedPointsValue = Math.floor(finalTotalValue);
            // Update the inner span for points
            this.dom.pointsEarned.closest('.points-text').innerHTML = `คุณจะได้รับ <span class="points-amount" id="pointsEarned">${earnedPointsValue.toLocaleString()}</span> แต้ม จากคำสั่งซื้อนี้`;
        },

        setupEventListeners() {
            // Handle address selection
            if (this.dom.addressesContainer) {
                this.dom.addressesContainer.addEventListener('click', e => {
                    const card = e.target.closest('.address-card');
                    if (card && card.dataset.addressId) {
                        this.selectAddress(card.dataset.addressId);
                    }
                });
            }

            // Handle payment method selection
            if (this.dom.paymentOptions) {
                this.dom.paymentOptions.addEventListener('click', e => {
                    const card = e.target.closest('.payment-card');
                    if (card && card.dataset.payment) {
                        this.selectPayment(card.dataset.payment);
                    }
                });
            }

            // Handle final checkout button click
            if (this.dom.checkoutButton) {
                this.dom.checkoutButton.addEventListener('click', () => {
                    this.proceedToPayment();
                });
            }

            // Handle back button
            if (this.dom.backButton) {
                this.dom.backButton.addEventListener('click', () => {
                    window.history.back();
                });
            }

            // Handle "Add new address" button
            if (this.dom.addAddressButton) {
                this.dom.addAddressButton.addEventListener('click', () => {
                    this.goToAddAddressPage();
                });
            }

            // Handle additional options
            if (this.dom.cutleryToggle) {
                this.dom.cutleryToggle.addEventListener('change', e => {
                    this.state.additionalOptions.wantsCutlery = e.target.checked;
                });
            }

            if (this.dom.deliveryNote) {
                this.dom.deliveryNote.addEventListener('input', e => {
                    this.state.additionalOptions.deliveryNote = e.target.value;
                });
            }
        },

        createAddressCardHTML(addr) {
            const addressLines = addr.line ? addr.line.replace(/<br>/g, '\n') : `${addr.addressLine || ''}\n${addr.subdistrict}, ${addr.district}\n${addr.province} ${addr.postalCode}`;
            const isSelected = this.state.selectedAddress === addr.id.toString();

            return `
                <div class="address-card ${isSelected ? 'selected' : ''}" data-address-id="${addr.id}">
                    <div class="address-header">
                        <div class="address-type">
                            <span class="address-label">${addr.type}</span>
                            ${addr.isDefault ? '<span class="address-tag">ค่าเริ่มต้น</span>' : ''}
                        </div>
                        <div class="radio-button"></div>
                    </div>
                    <div class="address-details">
                        ${addr.name}<br>
                        ${addressLines.replace(/\n/g, '<br>')}<br>
                        โทร: ${addr.phone}
                    </div>
                </div>
            `;
        },

        selectAddress(addressId) {
            this.state.selectedAddress = addressId;
            this.dom.addressesContainer.querySelectorAll('.address-card').forEach(card => {
                card.classList.toggle('selected', card.dataset.addressId === addressId);
            });
        },

        selectPayment(paymentMethod) {
            this.state.selectedPayment = paymentMethod;
            this.dom.paymentOptions.querySelectorAll('.payment-card').forEach(card => {
                card.classList.toggle('selected', card.dataset.payment === paymentMethod);
            });
        },

        goToAddAddressPage() {
            // Redirect to the page for adding a new address, adding a parameter to know where to return.
            // The path is relative from /checkout/ to /member/manage-addresses/
            window.location.href = '../member/manage-addresses/add-edit-address.html?from=checkout';
        },

        proceedToPayment() {
            // Get the current checkout data from state
            const currentCheckoutData = this.state.checkoutData;
            if (!currentCheckoutData) {
                alert('เกิดข้อผิดพลาด: ไม่พบข้อมูลการสั่งซื้อ');
                return;
            }

            // Add/update information from the checkout page state into the data object
            const updatedCheckoutData = {
                ...currentCheckoutData,
                selectedAddressId: this.state.selectedAddress,
                selectedPaymentMethod: this.state.selectedPayment,
                additionalOptions: this.state.additionalOptions
            };

            // Save the complete, updated data back to localStorage for the next step
            localStorage.setItem('ecolife_checkout_data', JSON.stringify(updatedCheckoutData));

            // แก้ไข: ตรวจสอบประเภทการชำระเงินและส่งไปยังหน้าที่ถูกต้อง
            if (this.state.selectedPayment === 'card') { 
                // ถ้าเลือก 'card' ให้ไปที่หน้าชำระด้วยบัตร
                window.location.href = 'steps/payment-card.html';
            } else if (this.state.selectedPayment === 'bank') { 
                // ถ้าเลือก 'bank' ให้ไปที่หน้าชำระด้วย QR
                window.location.href = 'steps/payment-qr.html';
            } else {
                alert('ช่องทางการชำระเงินนี้ยังไม่พร้อมใช้งาน');
            }
        }
    };

    CheckoutApp.init();
});