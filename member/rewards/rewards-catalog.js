document.addEventListener('DOMContentLoaded', () => {
    class RewardsCatalogManager {
        constructor() {
            // Mock data for rewards catalog
            this.rewardsDB = [
                { id: 'R001', type: 'voucher', title: 'คูปองส่วนลด 50 บาท', points: 500, image: '🎫', stock: 99 },
                { id: 'R002', type: 'voucher', title: 'คูปองส่งฟรี', points: 300, image: '🚚', stock: 99 },
                { id: 'R003', type: 'product', title: 'แก้วน้ำ Eco Life', points: 1200, image: '🥤', stock: 50 },
                { id: 'R004', type: 'product', title: 'โปรตีนบาร์ 1 กล่อง', points: 2500, image: '🍪', stock: 20 },
                { id: 'R005', type: 'special', title: 'Mystery Box', points: 1000, image: '🎁', stock: 10 },
                { id: 'R006', type: 'product', title: 'เสื้อยืด Eco Life', points: 3000, image: '👕', stock: 0 },
                { id: 'R007', type: 'voucher', title: 'คูปองส่วนลด 100 บาท', points: 950, image: '💰', stock: 99 },
                { id: 'R008', type: 'special', title: 'ปรึกษาโภชนาการ 30 นาที', points: 5000, image: '👩‍⚕️', stock: 5 },
            ];

            this.dom = {
                backButton: document.getElementById('backButton'),
                currentPoints: document.getElementById('currentPoints'),
                filterTabs: document.getElementById('filterTabs'),
                rewardsGrid: document.getElementById('rewardsGrid'),
                emptyState: document.getElementById('emptyState'),
                redeemModal: document.getElementById('redeemModal'),
                redeemModalBody: document.getElementById('redeemModalBody'),
                modalCloseBtn: document.querySelector('#redeemModal .modal-close'),
                modalCancelBtn: document.querySelector('#redeemModal .modal-cancel'),
                modalConfirmBtn: document.querySelector('#redeemModal .modal-confirm'),
                toast: document.getElementById('toast'),
                toastMessage: document.getElementById('toastMessage'),
            };

            this.state = {
                userPoints: 15750, // Mock user points
                currentFilter: 'all',
                rewardToRedeem: null,
            };

            this.init();
        }

        init() {
            this.dom.currentPoints.textContent = this.state.userPoints.toLocaleString();
            this.renderRewards();
            this.setupEventListeners();
        }

        renderRewards() {
            const filter = this.state.currentFilter;
            const filteredRewards = filter === 'all'
                ? this.rewardsDB
                : this.rewardsDB.filter(r => r.type === filter);

            if (filteredRewards.length === 0) {
                this.dom.rewardsGrid.innerHTML = '';
                this.dom.emptyState.style.display = 'block';
                return;
            }

            this.dom.emptyState.style.display = 'none';
            let html = '';
            filteredRewards.forEach(reward => {
                html += this.createRewardCard(reward);
            });
            this.dom.rewardsGrid.innerHTML = html;
        }

        createRewardCard(reward) {
            const canAfford = this.state.userPoints >= reward.points;
            const inStock = reward.stock > 0;
            const canRedeem = canAfford && inStock;

            return `
                <div class="reward-card" data-id="${reward.id}">
                    <div class="reward-image">
                        ${reward.image}
                        ${reward.type === 'special' ? '<span class="reward-tag">พิเศษ</span>' : ''}
                    </div>
                    <div class="reward-details">
                        <h3 class="reward-title">${reward.title}</h3>
                        <p class="reward-points">${reward.points.toLocaleString()} แต้ม</p>
                        <button class="redeem-button" data-id="${reward.id}" ${!canRedeem ? 'disabled' : ''}>
                            ${!inStock ? 'ของหมด' : !canAfford ? 'แต้มไม่พอ' : 'แลกเลย'}
                        </button>
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
                    this.state.currentFilter = e.target.dataset.filter;
                    this.renderRewards();
                }
            });

            this.dom.rewardsGrid.addEventListener('click', (e) => {
                if (e.target.classList.contains('redeem-button')) {
                    const rewardId = e.target.dataset.id;
                    this.handleRedeemClick(rewardId);
                }
            });

            // Modal listeners
            this.dom.modalCloseBtn.addEventListener('click', () => this.closeModal());
            this.dom.modalCancelBtn.addEventListener('click', () => this.closeModal());
            this.dom.redeemModal.addEventListener('click', (e) => {
                if (e.target === this.dom.redeemModal) this.closeModal();
            });
            this.dom.modalConfirmBtn.addEventListener('click', () => this.confirmRedemption());
        }

        handleRedeemClick(rewardId) {
            const reward = this.rewardsDB.find(r => r.id === rewardId);
            if (!reward) return;

            this.state.rewardToRedeem = reward;
            this.dom.redeemModalBody.innerHTML = `
                <p>คุณต้องการใช้ <strong>${reward.points.toLocaleString()}</strong> แต้ม เพื่อแลกรับ "${reward.title}" ใช่หรือไม่?</p>
                <p>แต้มคงเหลือหลังการแลก: <strong>${(this.state.userPoints - reward.points).toLocaleString()}</strong></p>
            `;
            this.openModal();
        }

        confirmRedemption() {
            const reward = this.state.rewardToRedeem;
            if (!reward) return;

            this.closeModal();
            this.showToast('กำลังดำเนินการ...', 'info');

            // Simulate API call
            setTimeout(() => {
                this.state.userPoints -= reward.points;
                reward.stock -= 1;

                this.dom.currentPoints.textContent = this.state.userPoints.toLocaleString();
                this.renderRewards(); // Re-render to update button states
                this.showToast('แลกของรางวัลสำเร็จ!', 'success');
            }, 1500);
        }

        openModal() {
            this.dom.redeemModal.style.display = 'flex';
        }

        closeModal() {
            this.dom.redeemModal.style.display = 'none';
            this.state.rewardToRedeem = null;
        }

        showToast(message, type = 'success') {
            const iconMap = { success: '✅', error: '❌', info: 'ℹ️' };
            this.dom.toast.querySelector('#toastIcon').textContent = iconMap[type] || '✅';
            this.dom.toastMessage.textContent = message;
            this.dom.toast.className = 'toast'; // Reset
            this.dom.toast.classList.add(type, 'show');
            setTimeout(() => {
                this.dom.toast.classList.remove('show');
            }, 3000);
        }
    }

    new RewardsCatalogManager();
});