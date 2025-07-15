document.addEventListener('DOMContentLoaded', () => {
    class PromotionsManager {
        constructor() {
            // Mock data for promotions
            this.promotionsDB = [
                { id: 'P001', type: 'sale', title: 'Mid-Year Sale ลดสูงสุด 30%', terms: 'สำหรับสินค้าที่ร่วมรายการ', expiry: '2024-07-31', image: 'https://images.unsplash.com/photo-1540420773420-2366e2c88c24?q=80&w=2070&auto=format&fit=crop' },
                { id: 'P002', type: 'bogo', title: 'ซื้อ 1 แถม 1 โปรตีนบาร์', terms: 'เฉพาะโปรตีนบาร์ Brand A', expiry: '2024-07-25', image: 'https://images.unsplash.com/photo-1627822459390-33924534b541?q=80&w=2070&auto=format&fit=crop' },
                { id: 'P003', type: 'member', title: 'สมาชิก Gold รับแต้ม x2', terms: 'ทุกการสั่งซื้อในเดือนนี้', expiry: '2024-07-31', image: 'https://images.unsplash.com/photo-1584776710883-705a13db12c6?q=80&w=1937&auto=format&fit=crop' },
                { id: 'P004', type: 'new', title: 'สินค้าใหม่! ลองเลย', terms: 'เครื่องดื่มเพื่อสุขภาพสูตรใหม่', expiry: '2024-08-15', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1887&auto=format&fit=crop' },
            ];

            this.dom = {
                backButton: document.getElementById('backButton'),
                filterTabs: document.getElementById('filterTabs'),
                promotionListContainer: document.getElementById('promotionListContainer'),
                emptyState: document.getElementById('emptyState'),
            };

            this.init();
        }

        init() {
            this.renderPromotions('all');
            this.setupEventListeners();
        }

        renderPromotions(filter) {
            const filteredPromotions = filter === 'all'
                ? this.promotionsDB
                : this.promotionsDB.filter(p => p.type === filter);

            if (filteredPromotions.length === 0) {
                this.dom.promotionListContainer.innerHTML = '';
                this.dom.emptyState.style.display = 'block';
                return;
            }

            this.dom.emptyState.style.display = 'none';
            let html = '';
            filteredPromotions.forEach(promo => {
                html += this.createPromotionCard(promo);
            });
            this.dom.promotionListContainer.innerHTML = html;
        }

        createPromotionCard(promo) {
            const expiryDate = new Date(promo.expiry).toLocaleDateString('th-TH', {
                day: 'numeric', month: 'short', year: 'numeric'
            });

            return `
                <div class="promotion-card" data-id="${promo.id}">
                    <div class="promotion-image" style="background-image: url('${promo.image}')">
                        <span class="promotion-tag">${promo.type.toUpperCase()}</span>
                    </div>
                    <div class="promotion-details">
                        <h3 class="promotion-title">${promo.title}</h3>
                        <p class="promotion-terms">${promo.terms}</p>
                        <p class="promotion-expiry">ใช้ได้ถึง: ${expiryDate}</p>
                    </div>
                </div>
            `;
        }

        setupEventListeners() {
            this.dom.backButton.addEventListener('click', () => window.history.back());

            this.dom.filterTabs.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-chip')) {
                    this.dom.filterTabs.querySelector('.active').classList.remove('active');
                    e.target.classList.add('active');
                    this.renderPromotions(e.target.dataset.filter);
                }
            });

            this.dom.promotionListContainer.addEventListener('click', (e) => {
                const card = e.target.closest('.promotion-card');
                if (card) {
                    alert(`ดูรายละเอียดโปรโมชั่น #${card.dataset.id}`);
                    // In a real app, you would navigate to a detail page or product listing
                    // window.location.href = `product-listing.html?promo=${card.dataset.id}`;
                }
            });
        }
    }

    new PromotionsManager();
});