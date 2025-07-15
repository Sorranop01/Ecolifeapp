document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Data ---
    // ในสถานการณ์จริง ข้อมูลนี้จะถูกดึงมาจาก API Server
    const MOCK_TRACKING_API = {
        // คำสั่งซื้อที่กำลังจัดส่ง
        "ECO123456": {
            eta: '10-15 นาที',
            progress: 75, // phone number added for call functionality
            driver: { name: 'คุณสมชาย ใจดี', avatar: '🧑‍💼', rating: '4.9', deliveryCount: '523', vehicle: '🏍️ มอเตอร์ไซค์ • ทะเบียน กข 1234', phone: '0812345678' },
            timeline: [
                { icon: '✅', title: 'รับออเดอร์แล้ว', time: '10:30 น.', details: 'เราได้รับคำสั่งซื้อของคุณแล้ว', completed: true, active: false },
                { icon: '🍳', title: 'กำลังเตรียมสินค้า', time: '10:45 น.', details: 'ร้าน Brand A กำลังจัดเตรียมอาหารของคุณ', completed: true, active: false },
                { icon: '🛵', title: 'คนส่งรับสินค้าแล้ว', time: '11:15 น.', details: 'คุณสมชาย กำลังมารับสินค้า', completed: true, active: false },
                { icon: '🚚', title: 'กำลังจัดส่ง', time: '11:30 น. - ปัจจุบัน', details: 'ระยะทาง 3.2 กม. จากที่อยู่ของคุณ', completed: false, active: true },
                { icon: '🎉', title: 'ส่งถึงแล้ว', time: 'คาดว่า 11:45-11:50 น.', details: '', completed: false, active: false }
            ],
            items: [ // Added productId for rating functionality
                { productId: 'p1', image: '🍱', name: 'ข้าวกล่องคลีน ไก่ย่างสมุนไพร', quantity: '2 กล่อง', price: 178 },
                { productId: 'p2', image: '🥗', name: 'สลัดผักสด น้ำสลัดงา', quantity: '1 กล่อง', price: 79 }
            ],
            customer: {
                name: 'คุณสมศรี ใจดี',
                phone: '08X-XXX-XXXX'
            },
            address: '123/45 คอนโด The Green Life ชั้น 8<br>ซ.สุขุมวิท 23 แขวงคลองเตย เขตคลองเตย<br>กรุงเทพฯ 10110',
            instructions: 'ฝากไว้กับ รปภ. ได้ (โทรมาก่อนถึง 5 นาที)'
        },
        // คำสั่งซื้อที่จัดส่งเรียบร้อยแล้ว
        "ECO789012": {
            eta: '0 นาที',
            progress: 100, // phone number added for call functionality
            driver: { name: 'คุณสมหญิง เก่งกล้า', avatar: '👩‍💼', rating: '4.8', deliveryCount: '312', vehicle: '🏍️ มอเตอร์ไซค์ • ทะเบียน จฉ 5678', phone: '0898765432' },
            timeline: [
                { icon: '✅', title: 'รับออเดอร์แล้ว', time: '09:00 น.', details: 'เราได้รับคำสั่งซื้อของคุณแล้ว', completed: true, active: false },
                { icon: '🍳', title: 'กำลังเตรียมสินค้า', time: '09:10 น.', details: 'ร้าน Pure Food กำลังจัดเตรียมอาหารของคุณ', completed: true, active: false },
                { icon: '🛵', title: 'คนส่งรับสินค้าแล้ว', time: '09:25 น.', details: 'คุณสมหญิง กำลังมารับสินค้า', completed: true, active: false },
                { icon: '🚚', title: 'กำลังจัดส่ง', time: '09:30 น.', details: 'คนส่งกำลังมาส่งที่บ้านคุณ', completed: true, active: false },
                { icon: '🎉', title: 'ส่งถึงแล้ว', time: '09:45 น.', details: 'จัดส่งเรียบร้อยแล้ว', completed: true, active: true } // 'active' ที่ขั้นตอนสุดท้ายหมายถึงสถานะสิ้นสุด
            ],
            items: [ // Added productId for rating functionality
                { productId: 'p3', image: '🍪', name: 'โปรตีนบาร์ ช็อกโกแลต', quantity: '3 ชิ้น', price: 177 },
                { productId: 'p4', image: '🥤', name: 'น้ำผลไม้สกัดเย็น', quantity: '2 ขวด', price: 98 }
            ],
            customer: {
                name: 'คุณวิชัย พัฒนา',
                phone: '09X-XXX-XXXX'
            },
            address: '999/88 อาคาร Eco Tower ชั้น 15<br>ถ.สาทรใต้ แขวงยานนาวา เขตสาทร<br>กรุงเทพฯ 10120',
            instructions: null // ไม่มีหมายเหตุ
        },
        // คำสั่งซื้อเริ่มต้น (สำหรับ ID อื่นๆ) ที่กำลังเตรียมสินค้า
        "DEFAULT": {
            eta: '25-30 นาที',
            progress: 25,
            driver: null, // ยังไม่มีคนขับ
            timeline: [
                { icon: '✅', title: 'รับออเดอร์แล้ว', time: '12:00 น.', details: 'เราได้รับคำสั่งซื้อของคุณแล้ว', completed: true, active: false },
                { icon: '🍳', title: 'กำลังเตรียมสินค้า', time: '12:05 น. - ปัจจุบัน', details: 'ร้าน Healthy Choice กำลังจัดเตรียมอาหารของคุณ', completed: false, active: true },
                { icon: '🛵', title: 'คนส่งรับสินค้าแล้ว', time: 'คาดว่า 12:15 น.', details: '', completed: false, active: false },
                { icon: '🚚', title: 'กำลังจัดส่ง', time: '', details: '', completed: false, active: false },
                { icon: '🎉', title: 'ส่งถึงแล้ว', time: '', details: '', completed: false, active: false }
            ],
            items: [ // Added productId for rating functionality
                { productId: 'p1', image: '🍱', name: 'ข้าวกล่องคลีน ไก่ย่าง', quantity: '1 กล่อง', price: 89 }
            ],
            customer: {
                name: 'ลูกค้าทั่วไป',
                phone: '08X-XXX-XXXX'
            },
            address: 'ที่อยู่ตัวอย่าง<br>กรุงเทพฯ',
            instructions: 'วางไว้หน้าประตู'
        }
    };

    /**
     * Manages the functionality of the Order Tracking page.
     */
    const OrderTrackingApp = {
        dom: {
            backButton: document.getElementById('backButton'),
            orderNumberDisplay: document.getElementById('orderNumber'),
            orderTimeline: document.getElementById('orderTimeline'),
            statusIcon: document.getElementById('statusIcon'),
            statusTitle: document.getElementById('statusTitle'),
            statusSubtitle: document.getElementById('statusSubtitle'),
            etaTime: document.getElementById('etaTime'),
            chatButton: document.getElementById('chatButton'),
            progressFill: document.getElementById('progressFill'),
            driverCard: document.querySelector('.driver-card'),
            driverAvatar: document.getElementById('driverAvatar'),
            driverName: document.getElementById('driverName'),
            driverRating: document.getElementById('driverRating'),
            deliveryCount: document.getElementById('deliveryCount'),
            driverVehicle: document.getElementById('driverVehicle'),
            callDriverButton: document.getElementById('callDriverButton'),
            chatDriverButton: document.getElementById('chatDriverButton'),
            // Elements for rating
            rateProductsCard: document.getElementById('rateProductsCard'),
            rateProductsBtn: document.getElementById('rateProductsBtn'),
            surveyPopup: document.getElementById('surveyPopup'),
            overlay: document.getElementById('overlay'),
            closeSurveyButton: document.getElementById('closeSurveyButton'),
            emojiRatingContainer: document.getElementById('emojiRating'),
            surveyBody: document.getElementById('surveyBody'),
            surveyThankYou: document.getElementById('surveyThankYou'),
            submitRatingButton: document.getElementById('submitRatingButton'),
            // Elements for order details
            orderItems: document.getElementById('orderItems'),
            deliveryAddress: document.getElementById('deliveryAddress'),
            instructionsBox: document.getElementById('instructionsBox'),
            helpButton: document.getElementById('helpButton'),
        },
        state: {
            orderId: null,
            trackingData: null,
            selectedDeliveryRating: 0,
        },

        init() {
            this.getParamsAndFetchData();
            this.bindEventListeners();
            console.log('Order Tracking page initialized.');
        },

        /**
         * Gets the order ID from the URL, fetches the corresponding data, and renders the page.
         */
        getParamsAndFetchData() {
            const urlParams = new URLSearchParams(window.location.search);
            this.state.orderId = urlParams.get('order');

            if (this.state.orderId) {
                this.fetchOrderData(this.state.orderId)
                    .then(data => {
                        this.state.trackingData = data;
                        this.renderPage();
                    })
                    .catch(error => {
                        console.error(error);
                        this.renderNotFound();
                    });
            } else {
                this.renderNotFound();
            }
        },

        /**
         * Simulates fetching order data from an API.
         * @param {string} orderId The ID of the order to fetch.
         * @returns {Promise<object>} A promise that resolves with the tracking data.
         */
        async fetchOrderData(orderId) {
            console.log(`Simulating API call for order: ${orderId}`);
            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

            const data = MOCK_TRACKING_API[orderId] || MOCK_TRACKING_API['DEFAULT'];
            if (data) {
                return data;
            } else {
                throw new Error(`Order with ID ${orderId} not found.`);
            }
        },

        /**
         * Binds event listeners to interactive elements.
         */
        bindEventListeners() {
            if (this.dom.backButton) {
                this.dom.backButton.addEventListener('click', () => window.history.back());
            }
            if (this.dom.chatButton) {
                this.dom.chatButton.addEventListener('click', () => this.handleChatDriver());
            }
            if (this.dom.callDriverButton) {
                this.dom.callDriverButton.addEventListener('click', () => this.handleCallDriver());
            }
            if (this.dom.chatDriverButton) {
                this.dom.chatDriverButton.addEventListener('click', () => this.handleChatDriver());
            }
            // Event listeners for rating popups
            if (this.dom.closeSurveyButton) {
                this.dom.closeSurveyButton.addEventListener('click', () => this.closePopups());
            }
            if (this.dom.overlay) {
                this.dom.overlay.addEventListener('click', () => this.closePopups());
            }
            if (this.dom.emojiRatingContainer) {
                this.dom.emojiRatingContainer.addEventListener('click', (e) => this.handleEmojiRating(e));
            }
            if (this.dom.submitRatingButton) {
                this.dom.submitRatingButton.addEventListener('click', () => this.handleSurveySubmission());
            }
            if (this.dom.helpButton) {
                this.dom.helpButton.addEventListener('click', () => this.handleHelpButtonClick());
            }
        },

        /**
         * Handles the "Call Driver" button click.
         */
        handleCallDriver() {
            const driver = this.state.trackingData?.driver;
            if (driver && driver.phone) {
                // This will trigger the phone app on a mobile device.
                window.location.href = `tel:${driver.phone}`;
            } else {
                alert('ไม่พบเบอร์โทรศัพท์ของคนขับ');
            }
        },

        /**
         * Handles the "Chat with Driver" button click.
         */
        handleChatDriver() {
            const driver = this.state.trackingData?.driver;
            if (driver) {
                // Navigate to the chat page, passing driver info as URL parameters
                // The path is relative from /orders/tracking/ to /member/support/chat/
                const chatUrl = `../../member/support/chat/chat.html?recipientId=driver_${this.state.orderId}&recipientName=${encodeURIComponent(driver.name)}&recipientAvatar=${encodeURIComponent(driver.avatar)}&recipientType=คนขับ`;
                window.location.href = chatUrl;
            } else {
                alert('ยังไม่มีคนขับที่ได้รับมอบหมาย');
            }
        },

        /**
         * Handles the "Contact Support" button click by navigating to the contact page.
         */
        handleHelpButtonClick() {
            // The path is relative from /orders/tracking/ to /contact/
            window.location.href = '../../contact/contact.html';
        },

        /**
         * Shows the rating popups (delivery survey and product rating card).
         */
        showRatingPopups() {
            // Add a small delay for better user experience, so the user sees the final status first.
            setTimeout(() => {
                if (this.dom.rateProductsCard) {
                    this.dom.rateProductsCard.style.display = 'flex';
                }
                if (this.dom.surveyPopup) {
                    this.dom.surveyPopup.style.display = 'block';
                }
                if (this.dom.overlay) {
                    this.dom.overlay.style.display = 'block';
                }
                document.body.classList.add('no-scroll'); // Prevent background scrolling
            }, 2500); // 2.5 second delay
        },


        /**
         * Closes the rating survey popup and overlay.
         */
        closePopups() {
            if (this.dom.surveyPopup) this.dom.surveyPopup.style.display = 'none';
            if (this.dom.overlay) this.dom.overlay.style.display = 'none';
            document.body.classList.remove('no-scroll');
        },

        /**
         * Handles the selection of an emoji for rating.
         * @param {Event} e The click event.
         */
        handleEmojiRating(e) {
            const button = e.target.closest('.emoji-button');
            if (!button) return;

            this.state.selectedDeliveryRating = parseInt(button.dataset.rating);

            this.dom.emojiRatingContainer.querySelectorAll('.emoji-button').forEach(btn => {
                btn.classList.remove('selected');
            });

            button.classList.add('selected');
            this.dom.submitRatingButton.disabled = false;
        },

        /**
         * Handles the submission of the delivery rating.
         */
        handleSurveySubmission() {
            if (this.state.selectedDeliveryRating === 0) return;

            this.dom.submitRatingButton.textContent = 'กำลังส่ง...';
            this.dom.submitRatingButton.disabled = true;

            // Simulate API call and update UI
            setTimeout(() => {
                // Hide the rating controls and show the thank you message
                if (this.dom.surveyBody) this.dom.surveyBody.style.display = 'none';
                if (this.dom.surveyThankYou) this.dom.surveyThankYou.style.display = 'block';

                // Mark this order as rated in localStorage to prevent showing the popup again.
                localStorage.setItem(`rated_order_${this.state.orderId}`, 'true');
                console.log(`Rating for order ${this.state.orderId} saved.`);

                // Close the entire popup after a short delay
                setTimeout(() => this.closePopups(), 2000);
            }, 1000);
        },

        /**
         * Checks if the order is delivered and shows rating cards if it is.
         */
        checkForDeliveredStatus() {
            const { trackingData, orderId } = this.state;
            if (!trackingData) return;

            // Check if the order has already been rated
            const hasRated = localStorage.getItem(`rated_order_${orderId}`) === 'true';
            if (hasRated) {
                console.log(`Order ${orderId} has already been rated. Skipping popup.`);
                return; // Don't show the popup
            }

            const lastStep = trackingData.timeline[trackingData.timeline.length - 1];
            // Check if the final step is "ส่งถึงแล้ว" and it is marked as completed.
            if (lastStep.title === 'ส่งถึงแล้ว' && lastStep.completed) {
                if (this.dom.rateProductsBtn) {
                    this.dom.rateProductsBtn.href = `../review/rate-order.html?order=${orderId}`;
                }
                // Trigger the popups
                this.showRatingPopups();
            }
        },

        /**
         * Renders the entire page based on the fetched tracking data.
         */
        renderPage() {
            const { orderId, trackingData } = this.state;
            if (!trackingData) return;

            const formattedOrderId = `#${orderId}`;
            document.title = `Eco Life - ติดตามคำสั่งซื้อ ${formattedOrderId}`;
            this.dom.orderNumberDisplay.textContent = formattedOrderId;

            this.renderTimeline(trackingData.timeline);
            this.renderStatusCard(trackingData);
            this.renderDriverInfo(trackingData.driver);
            this.renderOrderDetails(trackingData);
            this.checkForDeliveredStatus();
        },

        /**
         * Renders the order status timeline dynamically.
         * @param {Array<object>} timelineSteps - An array of timeline step objects.
         */
        renderTimeline(timelineSteps) {
            this.dom.orderTimeline.innerHTML = ''; // Clear static content
            timelineSteps.forEach(step => {
                const item = document.createElement('div');
                item.classList.add('timeline-item');
                if (step.completed) item.classList.add('completed');
                if (step.active) item.classList.add('active');

                item.innerHTML = `
                    <div class="timeline-icon">${step.icon}</div>
                    <div class="timeline-content">
                        <div class="timeline-title">${step.title}</div>
                        <div class="timeline-time">${step.time}</div>
                        ${step.details ? `<div class="timeline-details">${step.details}</div>` : ''}
                    </div>
                `;
                this.dom.orderTimeline.appendChild(item);
            });
        },

        /**
         * Updates the main status card (icon, title, ETA, progress bar).
         * @param {object} data - The tracking data for the order.
         */
        renderStatusCard({ timeline, eta, progress }) {
            const activeStep = timeline.find(step => step.active) || timeline.filter(s => s.completed).pop();
            if (!activeStep) return;

            this.dom.statusIcon.textContent = activeStep.icon;
            this.dom.statusTitle.textContent = activeStep.title;
            this.dom.statusSubtitle.textContent = activeStep.details;
            this.dom.etaTime.textContent = eta;
            this.dom.progressFill.style.width = `${progress}%`;
        },

        /**
         * Renders the order details section (items, address, instructions).
         * @param {object} data - The tracking data for the order.
         */
        renderOrderDetails({ items, customer, address, instructions }) {
            // 1. Render Order Items
            if (this.dom.orderItems && items) {
                this.dom.orderItems.innerHTML = ''; // Clear static content
                items.forEach(item => {
                    const itemEl = document.createElement('div');
                    itemEl.classList.add('order-item');
                    itemEl.innerHTML = `
                        <div class="item-image">${item.image}</div>
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-quantity">จำนวน ${item.quantity}</div>
                        </div>
                        <div class="item-price">฿${item.price}</div>
                    `;
                    this.dom.orderItems.appendChild(itemEl);
                });
            }

            // 2. Render Delivery Address
            if (this.dom.deliveryAddress && customer && address) {
                this.dom.deliveryAddress.innerHTML = `
                    ${customer.name}<br>
                    ${address}<br>
                    โทร: ${customer.phone}
                `;
            }

            // 3. Render Special Instructions
            if (this.dom.instructionsBox) {
                if (instructions) {
                    this.dom.instructionsBox.style.display = 'flex';
                    this.dom.instructionsBox.querySelector('.instructions-text').innerHTML = `<strong>หมายเหตุ:</strong> ${instructions}`;
                } else {
                    this.dom.instructionsBox.style.display = 'none';
                }
            }
        },

        /**
         * Updates the driver information card.
         * @param {object|null} driver - The driver data object, or null if not assigned.
         */
        renderDriverInfo(driver) {
            if (driver) {
                this.dom.driverCard.style.display = 'block';
                this.dom.driverAvatar.textContent = driver.avatar;
                this.dom.driverName.textContent = driver.name;
                this.dom.driverRating.textContent = driver.rating;
                this.dom.deliveryCount.textContent = driver.deliveryCount;
                this.dom.driverVehicle.textContent = driver.vehicle;
            } else {
                this.dom.driverCard.style.display = 'none';
            }
        },

        /**
         * Renders the page in a "not found" state.
         */
        renderNotFound() {
            this.dom.orderNumberDisplay.textContent = '#N/A';
            document.title = 'Eco Life - ไม่พบคำสั่งซื้อ';
            this.dom.orderTimeline.innerHTML = '<p class="not-found-message">ไม่พบข้อมูลการติดตามสำหรับคำสั่งซื้อนี้</p>';
            this.dom.driverCard.style.display = 'none';
            this.dom.statusTitle.textContent = 'ไม่พบข้อมูล';
            console.warn('Order ID not found or data fetch failed.');
        },
    };

    OrderTrackingApp.init();
});