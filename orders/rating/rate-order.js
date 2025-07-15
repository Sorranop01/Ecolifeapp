document.addEventListener('DOMContentLoaded', () => {
    class RateOrderManager {
        constructor() {
            // Mock data, in a real app this would come from a server/previous page
            this.ordersDB = {
                "ECO123456": {
                    date: '2024-07-10T14:40:00Z',
                    items: [
                        { id: '4', name: "สเต็กปลาแซลมอน", quantity: 1, price: 159, image: "🐟" },
                    ]
                },
                "ECO2567895": {
                    date: '2024-07-09T11:45:00Z',
                    items: [
                        { id: '1', name: "ข้าวกล่องคลีน ไก่ย่างสมุนไพร", quantity: 2, price: 178, image: "🍱" },
                        { id: '2', name: "สลัดผักสด น้ำสลัดงา", quantity: 1, price: 79, image: "🥗" },
                        { id: '3', name: "โปรตีนบาร์ ช็อกโกแลต", quantity: 3, price: 177, image: "🍪" },
                    ]
                }
            };

            this.dom = {
                backButton: document.getElementById('backButton'),
                orderId: document.getElementById('orderId'),
                orderDate: document.getElementById('orderDate'),
                ratingItemsContainer: document.getElementById('ratingItemsContainer'),
                submitReviewBtn: document.getElementById('submitReviewBtn'),
                toast: document.getElementById('toast'),
                toastMessage: document.getElementById('toastMessage'),
            };

            this.state = {
                orderId: null,
                orderData: null,
                reviews: {} // { productId: { rating: 0, text: '' } }
            };

            this.init();
        }

        init() {
            const urlParams = new URLSearchParams(window.location.search);
            this.state.orderId = urlParams.get('orderId');
            this.state.orderData = this.ordersDB[this.state.orderId];

            if (!this.state.orderData) {
                document.querySelector('.container').innerHTML = '<h1>ไม่พบคำสั่งซื้อ</h1>';
                return;
            }

            this.render();
            this.setupEventListeners();
        }

        render() {
            this.dom.orderId.textContent = `#${this.state.orderId}`;
            this.dom.orderDate.textContent = new Date(this.state.orderData.date).toLocaleDateString('th-TH', {
                year: 'numeric', month: 'short', day: 'numeric'
            });

            let itemsHtml = '';
            this.state.orderData.items.forEach(item => {
                this.state.reviews[item.id] = { rating: 0, text: '' }; // Initialize review state
                itemsHtml += `
                    <div class="rating-item-card" data-product-id="${item.id}">
                        <div class="product-info-row">
                            <div class="product-image">${item.image}</div>
                            <p class="product-name">${item.name}</p>
                        </div>
                        <div class="rating-section">
                            <p class="rating-label">ให้คะแนนสินค้าชิ้นนี้</p>
                            <div class="star-rating">
                                <span class="star" data-value="5">★</span>
                                <span class="star" data-value="4">★</span>
                                <span class="star" data-value="3">★</span>
                                <span class="star" data-value="2">★</span>
                                <span class="star" data-value="1">★</span>
                            </div>
                        </div>
                        <div class="review-section">
                            <textarea class="review-textarea" placeholder="เขียนรีวิวของคุณที่นี่..."></textarea>
                            <button class="add-photo-button">📷 เพิ่มรูปภาพ</button>
                        </div>
                    </div>
                `;
            });
            this.dom.ratingItemsContainer.innerHTML = itemsHtml;
        }

        setupEventListeners() {
            this.dom.backButton.addEventListener('click', () => window.history.back());
            
            this.dom.ratingItemsContainer.querySelectorAll('.star').forEach(star => {
                star.addEventListener('click', (e) => this.handleStarClick(e));
            });

            this.dom.ratingItemsContainer.querySelectorAll('.review-textarea').forEach(textarea => {
                textarea.addEventListener('input', (e) => this.handleTextareaInput(e));
            });

            this.dom.submitReviewBtn.addEventListener('click', () => this.submitReviews());
        }

        handleStarClick(event) {
            const star = event.currentTarget;
            const rating = parseInt(star.dataset.value);
            const starContainer = star.parentElement;
            const productId = star.closest('.rating-item-card').dataset.productId;

            this.state.reviews[productId].rating = rating;

            starContainer.classList.add('rated');
            starContainer.querySelectorAll('.star').forEach(s => {
                s.classList.remove('selected');
            });
            star.classList.add('selected');
        }

        handleTextareaInput(event) {
            const textarea = event.currentTarget;
            const productId = textarea.closest('.rating-item-card').dataset.productId;
            this.state.reviews[productId].text = textarea.value;
        }

        submitReviews() {
            console.log('Submitting reviews:', this.state.reviews);
            this.dom.submitReviewBtn.textContent = 'กำลังส่ง...';
            this.dom.submitReviewBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                this.showToast('ขอบคุณสำหรับรีวิวของคุณ!');
                setTimeout(() => {
                    window.location.href = 'member-dashboard.html';
                }, 1500);
            }, 1000);
        }

        showToast(message, type = 'success') {
            this.dom.toastMessage.textContent = message;
            this.dom.toast.className = 'toast'; // Reset
            this.dom.toast.classList.add(type, 'show');
            setTimeout(() => {
                this.dom.toast.classList.remove('show');
            }, 3000);
        }
    }

    new RateOrderManager();
});