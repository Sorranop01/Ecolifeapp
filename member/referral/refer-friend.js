document.addEventListener('DOMContentLoaded', () => {
    class ReferFriendManager {
        constructor() {
            this.historyDB = [
                { name: 'สมชาย ใจดี', status: 'สำเร็จ', reward: '+100 แต้ม', date: '2024-07-10' },
                { name: 'สุดา รักเพื่อน', status: 'รอเพื่อนสั่งซื้อ', reward: '-', date: '2024-07-08' },
            ];

            this.dom = {
                backButton: document.getElementById('backButton'),
                copyCodeBtn: document.getElementById('copyCodeBtn'),
                referralCode: document.getElementById('referralCode'),
                historyList: document.getElementById('historyList'),
                toast: document.getElementById('toast'),
                toastMessage: document.getElementById('toastMessage'),
            };

            this.init();
        }

        init() {
            this.renderHistory();
            this.setupEventListeners();
        }

        renderHistory() {
            let html = '';
            this.historyDB.forEach(item => {
                html += `
                    <div class="history-item">
                        <div>
                            <p class="history-name">${item.name}</p>
                            <p class="history-status">${item.status}</p>
                        </div>
                        <p class="history-reward ${item.status === 'สำเร็จ' ? 'success' : ''}">${item.reward}</p>
                    </div>
                `;
            });
            this.dom.historyList.innerHTML = html;
        }

        setupEventListeners() {
            this.dom.backButton.addEventListener('click', () => window.history.back());

            this.dom.copyCodeBtn.addEventListener('click', () => this.copyCode());
        }

        copyCode() {
            const code = this.dom.referralCode.textContent;
            navigator.clipboard.writeText(code).then(() => {
                this.showToast('คัดลอกรหัสแล้ว!');
                this.dom.copyCodeBtn.textContent = 'คัดลอกแล้ว';
                setTimeout(() => {
                    this.dom.copyCodeBtn.textContent = 'คัดลอก';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                this.showToast('ไม่สามารถคัดลอกได้', 'error');
            });
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

    new ReferFriendManager();
});