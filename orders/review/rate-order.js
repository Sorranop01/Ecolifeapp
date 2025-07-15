document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Data (Copied from order-tracking.js for demonstration) ---
    const MOCK_TRACKING_API = {
        "ECO123456": {
            items: [
                { productId: 'p1', image: '🍱', name: 'ข้าวกล่องคลีน ไก่ย่างสมุนไพร', quantity: '2 กล่อง', price: 178 },
                { productId: 'p2', image: '🥗', name: 'สลัดผักสด น้ำสลัดงา', quantity: '1 กล่อง', price: 79 }
            ],
        },
        "ECO789012": {
            items: [
                { productId: 'p3', image: '🍪', name: 'โปรตีนบาร์ ช็อกโกแลต', quantity: '3 ชิ้น', price: 177 },
                { productId: 'p4', image: '🥤', name: 'น้ำผลไม้สกัดเย็น', quantity: '2 ขวด', price: 98 }
            ],
        },
        "DEFAULT": {
            items: [
                { productId: 'p1', image: '🍱', name: 'ข้าวกล่องคลีน ไก่ย่าง', quantity: '1 กล่อง', price: 89 }
            ],
        }
    };

    const RateOrderApp = {
        dom: {
            backButton: document.getElementById('backButton'),
            ratingContent: document.getElementById('ratingContent'),
            submitAllRatingsBtn: document.getElementById('submitAllRatingsBtn'),
        },
        state: {
            orderId: null,
            orderItems: [],
            ratings: {}, // { productId: { score: 0, review: '' } }
        },

        init() {
            this.getOrderId();
            this.fetchAndRenderItems();
            this.bindEventListeners();
        },

        getOrderId() {
            const urlParams = new URLSearchParams(window.location.search);
            this.state.orderId = urlParams.get('order');
        },

        async fetchAndRenderItems() {
            if (!this.state.orderId) {
                this.dom.ratingContent.innerHTML = '<p>ไม่พบหมายเลขคำสั่งซื้อ</p>';
                return;
            }
            // Simulate API call
            const orderData = MOCK_TRACKING_API[this.state.orderId] || MOCK_TRACKING_API['DEFAULT'];
            this.state.orderItems = orderData.items;

            if (this.state.orderItems.length > 0) {
                this.dom.ratingContent.innerHTML = this.state.orderItems.map(item => this.createProductCardHTML(item)).join('');
            } else {
                this.dom.ratingContent.innerHTML = '<p>ไม่พบสินค้าในคำสั่งซื้อนี้</p>';
            }
        },

        createProductCardHTML(item) {
            // Use a unique ID for each product
            const productId = item.productId;
            return `
                <div class="product-rating-card" data-product-id="${productId}">
                    <div class="product-info">
                        <div class="product-image">${item.image}</div>
                        <p class="product-name">${item.name}</p>
                    </div>
                    <div class="rating-section">
                        <h3>ให้คะแนนสินค้า</h3>
                        <div class="star-rating">
                            <span class="star" data-value="1">⭐</span>
                            <span class="star" data-value="2">⭐</span>
                            <span class="star" data-value="3">⭐</span>
                            <span class="star" data-value="4">⭐</span>
                            <span class="star" data-value="5">⭐</span>
                        </div>
                        <h3>เขียนรีวิว (ไม่บังคับ)</h3>
                        <textarea class="review-textarea" placeholder="สินค้าเป็นอย่างไรบ้าง..."></textarea>
                    </div>
                </div>
            `;
        },

        bindEventListeners() {
            this.dom.backButton.addEventListener('click', () => window.history.back());

            this.dom.ratingContent.addEventListener('click', e => {
                if (e.target.classList.contains('star')) {
                    this.handleStarClick(e.target);
                }
            });

            this.dom.submitAllRatingsBtn.addEventListener('click', () => this.submitRatings());
        },

        handleStarClick(clickedStar) {
            const card = clickedStar.closest('.product-rating-card');
            const productId = card.dataset.productId;
            const rating = parseInt(clickedStar.dataset.value, 10);

            // Update state
            if (!this.state.ratings[productId]) this.state.ratings[productId] = {};
            this.state.ratings[productId].score = rating;

            // Update UI
            const stars = card.querySelectorAll('.star');
            stars.forEach(star => {
                star.classList.toggle('selected', parseInt(star.dataset.value, 10) <= rating);
            });
        },

        submitRatings() {
            // Collect all reviews
            this.dom.ratingContent.querySelectorAll('.product-rating-card').forEach(card => {
                const productId = card.dataset.productId;
                const reviewText = card.querySelector('.review-textarea').value;
                if (!this.state.ratings[productId]) this.state.ratings[productId] = {};
                this.state.ratings[productId].review = reviewText;
            });

            console.log('Submitting ratings:', this.state.ratings);
            this.dom.submitAllRatingsBtn.textContent = 'กำลังส่ง...';
            this.dom.submitAllRatingsBtn.disabled = true;

            setTimeout(() => {
                alert('ขอบคุณสำหรับคะแนนและรีวิว!');
                window.location.href = `../tracking/order-tracking.html?order=${this.state.orderId}`;
            }, 1500);
        }
    };

    RateOrderApp.init();
});