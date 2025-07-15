// EcoLife Member Dashboard JavaScript
// Project Structure: All files in same directory
// Usage: Include this file in member-dashboard.html
// Dependencies: member-dashboard.css for styling

const TIER_DETAILS = {
    bronze: {
        title: 'Bronze Member',
        icon: '🥉',
        requirement: 'เริ่มต้นเป็นสมาชิก',
        benefits: [
            'สะสมแต้มทุกการใช้จ่าย 1 บาท = 1 แต้ม',
            'ส่วนลด 5% สำหรับสินค้าที่ร่วมรายการ',
            'ของขวัญต้อนรับสมาชิกใหม่'
        ]
    },
    silver: {
        title: 'Silver Member',
        icon: '🥈',
        requirement: 'ยอดใช้จ่ายสะสม 5,000 บาท',
        benefits: [
            'สิทธิประโยชน์ทั้งหมดของ Bronze',
            '<strong>รับแต้ม x1.2</strong> ทุกการใช้จ่าย',
            'คูปองส่วนลดพิเศษประจำเดือน',
            'ของขวัญวันเกิด'
        ]
    },
    gold: {
        title: 'Gold Member',
        icon: '🥇',
        requirement: 'ยอดใช้จ่ายสะสม 15,000 บาท',
        benefits: [
            'สิทธิประโยชน์ทั้งหมดของ Silver',
            '<strong>รับแต้ม x1.5</strong> ทุกการใช้จ่าย',
            '<strong>จัดส่งฟรีทุกออเดอร์</strong> ไม่มีขั้นต่ำ',
            'Cashback 3% ในรูปแบบแต้ม',
            'สิทธิ์ในการซื้อสินค้า Flash Sale ก่อนใคร'
        ]
    },
    platinum: {
        title: 'Platinum Member',
        icon: '💎',
        requirement: 'ยอดใช้จ่ายสะสม 30,000 บาท',
        benefits: [
            'สิทธิประโยชน์ทั้งหมดของ Gold',
            '<strong>รับแต้ม x2</strong> ทุกการใช้จ่าย',
            '<strong>Cashback 5%</strong> ในรูปแบบแต้ม',
            'ของขวัญสุดพิเศษประจำปี',
            'ผู้ดูแลส่วนตัวและสิทธิพิเศษอื่นๆ'
        ]
    }
};

class MemberDashboard {
    constructor() {
        this.memberData = null;
        this.countdownTimer = null;
        this.activityData = [];

        this.dom = {
            modal: document.getElementById('genericModal'),
            modalTitle: document.getElementById('modalTitle'),
            modalBody: document.getElementById('modalBody'),
            modalCloseButton: document.getElementById('modalCloseButton'),
            modalActionButton: document.getElementById('modalActionButton'),
            notificationTemplate: document.getElementById('notificationTemplate'),
            notificationPopup: document.getElementById('notificationPopup'),
            notificationOverlay: document.getElementById('notificationOverlay'),
            closeNotificationPopup: document.getElementById('closeNotificationPopup'),
            notificationPopupList: document.getElementById('notificationPopupList'),
            viewAllNotificationsLink: document.getElementById('viewAllNotificationsLink'),
            notificationItemTemplate: document.getElementById('notificationItemTemplate'),
            notificationBadge: document.getElementById('notificationBadge')
        };

        this.init();
    }

    init() {
        this.loadMemberData();
        this.setupEventListeners();
        this.initializeCountdown();
        this.loadActivityData();
        this.updateActivityDisplay();
        this.animateOnLoad();
        this.fetchUnreadCount();
    }

    // Load member data from localStorage or API
    loadMemberData() {
        // Try to load from localStorage first
        const storedData = localStorage.getItem('memberData');
        if (storedData) {
            this.memberData = JSON.parse(storedData);
        } else {
            // Mock member data
            this.memberData = {
                id: 1,
                name: 'คุณสมศรี ใจดี',
                email: 'somsri@example.com',
                phone: '0812345678',
                tier: 'gold',
                points: 15750,
                expiringPoints: 500,
                expiryDate: '2024-12-31',
                totalSpent: 22500,
                nextTierAmount: 7500,
                nextTier: 'platinum',
                avatar: '👑',
                joinDate: '2023-01-15',
                birthdate: '1988-05-20'
            };
        }
        
        this.updateMemberDisplay();
    }

    // Update member information display
    updateMemberDisplay() {
        const { name, tier, points, expiringPoints, expiryDate, nextTierAmount, nextTier } = this.memberData;
        
        // Update member name
        document.getElementById('memberName').textContent = name;
        
        // Update points
        document.getElementById('currentPoints').textContent = points.toLocaleString();
        
        // Update expiring points
        document.getElementById('pointsExpiry').innerHTML = `
            <span>⏰</span>
            <span>มี ${expiringPoints.toLocaleString()} แต้มจะหมดอายุ ${this.formatDate(expiryDate)}</span>
        `;
        
        // Update tier progress
        const progress = this.calculateTierProgress();
        document.getElementById('progressTitle').textContent = `ระยะทางสู่ ${this.getTierName(nextTier)}`;
        document.getElementById('progressInfo').textContent = `${progress}%`;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').innerHTML = `
            ซื้ออีก <strong>฿${nextTierAmount.toLocaleString()}</strong> เพื่ออัพเกรดเป็น ${this.getTierName(nextTier)}
        `;
        
        // Update tier display
        this.updateTierDisplay();
    }

    // Calculate progress to next tier
    calculateTierProgress() {
        const tierThresholds = {
            bronze: 0,
            silver: 5000,
            gold: 15000,
            platinum: 30000
        };
        
        const currentTierThreshold = tierThresholds[this.memberData.tier];
        const nextTierThreshold = tierThresholds[this.memberData.nextTier];
        const progress = ((this.memberData.totalSpent - currentTierThreshold) / (nextTierThreshold - currentTierThreshold)) * 100;
        
        return Math.min(Math.max(progress, 0), 100);
    }

    // Get tier display name
    getTierName(tier) {
        const tierNames = {
            bronze: 'Bronze',
            silver: 'Silver',
            gold: 'Gold',
            platinum: 'Platinum'
        };
        return tierNames[tier] || tier;
    }

    // Update tier comparison display
    updateTierDisplay() {
        const tierItems = document.querySelectorAll('.tier-item');
        tierItems.forEach(item => {
            const tierType = item.getAttribute('data-tier');
            item.classList.remove('current', 'next');
            
            if (tierType === this.memberData.tier) {
                item.classList.add('current');
            } else if (tierType === this.memberData.nextTier) {
                item.classList.add('next');
            }
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Header buttons
        document.getElementById('backButton').addEventListener('click', () => this.navigateBack());
        document.getElementById('notificationButton').addEventListener('click', () => this.navigateToNotifications());

        // Quick action buttons
        document.getElementById('rewardsButton').addEventListener('click', () => this.showRewards());
        document.getElementById('pointsHistoryButton').addEventListener('click', () => this.showPointsHistory());
        document.getElementById('couponsButton').addEventListener('click', () => this.showCoupons());
        document.getElementById('referralButton').addEventListener('click', () => this.showReferral());

        // Benefit buttons
        document.getElementById('birthdayOfferButton').addEventListener('click', () => this.showBirthdayOffer());
        document.getElementById('viewAllBenefitsButton').addEventListener('click', () => this.showAllBenefits());

        // Special offer buttons
        document.getElementById('shopNowButton').addEventListener('click', () => this.shopNow());
        document.getElementById('mysteryBoxButton').addEventListener('click', () => this.redeemMysteryBox());

        // Activity section
        document.getElementById('viewMoreActivity').addEventListener('click', () => this.showMoreActivity());

        // Tier items
        document.querySelectorAll('.tier-item').forEach(item => {
            item.addEventListener('click', () => this.showTierDetails(item.getAttribute('data-tier')));
        });

        // Points display click
        document.querySelector('.points-display').addEventListener('click', () => this.showPointsDetails());

        // Progress bar click
        document.querySelector('.progress-bar').addEventListener('click', () => this.showProgressDetails());

        // Motivational badge
        document.getElementById('motivationBadge').addEventListener('click', () => this.showMotivationalMessage());

        // Avatar click
        document.getElementById('memberAvatar').addEventListener('click', () => this.showProfileOptions());

        // Modal listeners
        if (this.dom.modal) {
            this.dom.modalCloseButton.addEventListener('click', () => this.hideModal());
            this.dom.modal.addEventListener('click', (e) => {
                if (e.target === this.dom.modal) this.hideModal();
            });
        }

        // Notification Popup listeners
        if (this.dom.notificationPopup) {
            this.dom.closeNotificationPopup.addEventListener('click', () => this.hideNotificationPopup());
            this.dom.notificationOverlay.addEventListener('click', () => this.hideNotificationPopup());
            this.dom.viewAllNotificationsLink.addEventListener('click', () => {
                window.location.href = '../../notification/notifications.html';
            });
        }
    }

    // Navigation methods
    navigateBack() {
        window.location.href = '../../home/index.html';
    }

    navigateToHome() {
        window.location.href = '../../home/index.html';
    }

    navigateToCategories() {
        window.location.href = '../../Product/listing/product-listing.html';
    }

    navigateToProfile() {
        window.location.href = '../profile/user-profile.html';
    }

    navigateToNotifications() {
        window.location.href = '../../notification/notifications.html';
    }

    // Feature methods
    showNotifications() {
        // This method is now superseded by showNotificationPopup
        this.showNotificationPopup();
    }

    showSettings() {
        this.showNotification('⚙️ กำลังเปิดหน้าตั้งค่า...', 'info');
        setTimeout(() => {
            window.location.href = '../../profile/settings.html'; // Assuming settings is under profile
        }, 1000);
    }

    showRewards() {
        this.showNotification('🎁 กำลังเปิดร้านของรางวัล...', 'info');
        setTimeout(() => {
            window.location.href = '../rewards/rewards-catalog.html';
        }, 1000);
    }

    showPointsHistory() {
        this.showNotification('📊 กำลังโหลดประวัติแต้ม...', 'info');
        setTimeout(() => {
            window.location.href = '../points/points-history.html';
        }, 1000);
    }

    showCoupons() {
        this.showNotification('🎫 กำลังเปิดคูปองของคุณ...', 'info');
        setTimeout(() => {
            window.location.href = '../coupons/my-coupons.html';
        }, 1000);
    }

    showReferral() {
        this.showNotification('👥 กำลังเปิดหน้าแนะนำเพื่อน...', 'info');
        setTimeout(() => {
            window.location.href = '../referral/refer-friend.html';
        }, 1000);
    }

    showBirthdayOffer() {
        const offerContent = `
            <p>สุขสันต์วันเกิด! 🎂</p>
            <p>รับส่วนลดพิเศษ <strong>20%</strong> สำหรับการสั่งซื้อครั้งถัดไป และรับของขวัญสุดพิเศษจากเรา</p>
            <p><em>*คูปองจะถูกส่งไปยังหน้า "คูปองของฉัน" โดยอัตโนมัติ</em></p>
        `;
        
        const onAction = () => {
            this.hideModal();
            this.showCoupons(); // Navigate to coupons page
        };
        this.showModal('ข้อเสนอพิเศษวันเกิด', offerContent, 'ไปที่หน้าคูปอง', onAction);
    }

    showAllBenefits() {
        this.showNotification('🌟 กำลังแสดงสิทธิประโยชน์ทั้งหมด...', 'info');
        setTimeout(() => {
            window.location.href = '../../benefits/benefits.html';
        }, 1000);
    }

    shopNow() {
        this.showNotification('🛒 กำลังพาไปยังหน้าช็อป...', 'info');
        setTimeout(() => {
            window.location.href = '../../home/index.html#special-offers';
        }, 1000);
    }

    async redeemMysteryBox() {
        if (this.memberData.points < 1000) {
            this.showNotification('❌ แต้มของคุณไม่เพียงพอ', 'error');
            return;
        }

        if (confirm('ต้องการแลก Mystery Box ด้วย 1,000 แต้มใช่หรือไม่?')) {
            try {
                // Simulate API call
                await this.processRedemption('mystery_box', 1000);
                
                this.memberData.points -= 1000;
                this.updateMemberDisplay();
                
                this.showNotification('🎉 แลก Mystery Box สำเร็จ! ตรวจสอบในหน้าของรางวัล', 'success');
                
                // Add activity
                this.addActivity('🎁', 'แลก Mystery Box', '-1,000 แต้ม', 'เมื่อกี้นี้');
                
            } catch (error) {
                this.showNotification('❌ เกิดข้อผิดพลาดในการแลก', 'error');
            }
        }
    }

    showMoreActivity() {
        const modalContent = this.renderActivityModalContent();
        this.showModal('ประวัติกิจกรรมทั้งหมด', modalContent, 'ปิด');
    }

    renderActivityModalContent() {
        if (this.activityData.length === 0) {
            return '<p>ยังไม่มีกิจกรรม</p>';
        }

        const activityItemsHTML = this.activityData.map(activity => {
            const pointsClass = activity.points.startsWith('-') ? 'spent' : 'earned';
            return `
                <div class="activity-item">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-points ${pointsClass}">${activity.points}</div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                </div>
            `;
        }).join('');

        return `<div class="activity-list-modal">${activityItemsHTML}</div>`;
    }

    showTierDetails(tier) {
        const details = TIER_DETAILS[tier];
        if (!details) {
            console.error(`No details found for tier: ${tier}`);
            return;
        }

        const benefitsHTML = details.benefits.map(benefit => `<li>${benefit}</li>`).join('');

        const contentHTML = `
            <div class="tier-details-modal-body">
                <div class="tier-modal-header">
                    <div class="tier-modal-icon">${details.icon}</div>
                    <div class="tier-modal-requirement"><strong>เงื่อนไข:</strong> ${details.requirement}</div>
                </div>
                <h4>สิทธิประโยชน์:</h4>
                <ul class="tier-benefits-list">
                    ${benefitsHTML}
                </ul>
            </div>
        `;

        this.showModal(details.title, contentHTML, 'ปิด');
    }

    showPointsDetails() {
        this.showNotification('💎 รายละเอียดแต้มสะสม', 'info');
        // TODO: Show points breakdown modal
    }

    showProgressDetails() {
        this.showNotification('📈 รายละเอียดความก้าวหน้าของคุณ', 'info');
        // TODO: Show progress details modal
    }

    showMotivationalMessage() {
        const messages = [
            'คุณเก่งมาก! อีกนิดเดียวถึง Platinum แล้ว! 🏆',
            'ยอดเยี่ยม! คุณเป็นลูกค้าที่ดีที่สุด 🌟',
            'เหลืออีกแค่ ฿7,500 เท่านั้น! 💪',
            'คุณเป็นแรงบันดาลใจให้เรา! 💖'
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.showNotification(randomMessage, 'success');
    }

    showProfileOptions() {
        this.showNotification('👤 กำลังเปิดตัวเลือกโปรไฟล์...', 'info');
        setTimeout(() => {
            window.location.href = '../../profile/profile.html';
        }, 1000);
    }

    // Countdown timer for special offers
    initializeCountdown() {
        // Set end time (2 days from now)
        const endTime = new Date().getTime() + (2 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000) + (32 * 60 * 1000) + (15 * 1000);
        
        this.countdownTimer = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;
            
            if (distance < 0) {
                clearInterval(this.countdownTimer);
                document.getElementById('countdownTimer').textContent = 'หมดเวลาแล้ว';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            document.getElementById('countdownTimer').textContent = 
                `เหลือเวลา ${days} วัน ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // Activity management
    loadActivityData() {
        this.activityData = [
            {
                icon: '🛒',
                title: 'สั่งซื้อสำเร็จ #ECO2567894',
                points: '+890 แต้ม',
                time: 'เมื่อวานนี้ 14:30',
                type: 'purchase'
            },
            {
                icon: '🎁',
                title: 'แลกคูปองส่วนลด 100 บาท',
                points: '-1,000 แต้ม',
                time: '3 วันที่แล้ว',
                type: 'redemption'
            },
            {
                icon: '⭐',
                title: 'รีวิวสินค้า 5 ดาว',
                points: '+50 แต้ม',
                time: '5 วันที่แล้ว',
                type: 'review'
            },
            {
                icon: '🎂',
                title: 'โบนัสวันเกิด',
                points: '+500 แต้ม',
                time: '1 เดือนที่แล้ว',
                type: 'birthday'
            },
            {
                icon: '👥',
                title: 'แนะนำเพื่อนสำเร็จ',
                points: '+200 แต้ม',
                time: '2 เดือนที่แล้ว',
                type: 'referral'
            },
            {
                icon: '🛒',
                title: 'สั่งซื้อสำเร็จ #ECO2567112',
                points: '+1,250 แต้ม',
                time: '2 เดือนที่แล้ว',
                type: 'purchase'
            },
            {
                icon: '🚚',
                title: 'แลกส่วนลดค่าจัดส่ง',
                points: '-150 แต้ม',
                time: '2 เดือนที่แล้ว',
                type: 'redemption'
            }
        ];
    }

    addActivity(icon, title, points, time, type = 'other') {
        const newActivity = { icon, title, points, time, type };
        this.activityData.unshift(newActivity);
        this.updateActivityDisplay();
    }

    updateActivityDisplay() {
        const activityList = document.getElementById('activityList');
        const template = document.getElementById('activityItemTemplate');

        if (!activityList || !template) {
            console.error('Activity list or template not found!');
            return;
        }

        // Clear existing items
        activityList.innerHTML = '';

        const displayItems = this.activityData.slice(0, 3);
        
        displayItems.forEach(activity => {
            const clone = template.content.cloneNode(true);
            
            const iconEl = clone.querySelector('[data-activity="icon"]');
            const titleEl = clone.querySelector('[data-activity="title"]');
            const pointsEl = clone.querySelector('[data-activity="points"]');
            const timeEl = clone.querySelector('[data-activity="time"]');

            if (iconEl) iconEl.textContent = activity.icon;
            if (titleEl) titleEl.textContent = activity.title;
            if (pointsEl) {
                pointsEl.textContent = activity.points;
                // Add class for styling based on points
                if (activity.points.startsWith('-')) {
                    pointsEl.classList.add('spent');
                } else {
                    pointsEl.classList.add('earned');
                }
            }
            if (timeEl) timeEl.textContent = activity.time;

            activityList.appendChild(clone);
        });
    }

    // Notification Popup Methods
    async showNotificationPopup() {
        if (!this.dom.notificationPopup) return;

        await this.renderNotificationPopup();
        this.dom.notificationPopup.classList.add('show');
        this.dom.notificationOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    async renderNotificationPopup() {
        const list = this.dom.notificationPopupList;
        const template = this.dom.notificationItemTemplate;

        if (!list || !template) {
            console.error("Notification popup elements not found!");
            return;
        }

        list.innerHTML = '<div class="loading-spinner-popup"></div>';

        try {
            const response = await fetch('../../notification/notifications.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const htmlText = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            
            const notificationListSource = doc.getElementById('notificationsList');
            
            if (notificationListSource && notificationListSource.children.length > 0) {
                list.innerHTML = ''; // Clear loading spinner
                
                // Get first 5 notifications
                const itemsToDisplay = Array.from(notificationListSource.children).slice(0, 5);
                
                itemsToDisplay.forEach(item => {
                   const clone = template.content.cloneNode(true);
                   const popupItem = clone.querySelector('.notification-popup-item');
                   const iconEl = clone.querySelector('.notification-popup-icon');
                   const titleEl = clone.querySelector('.notification-popup-title');
                   const timeEl = clone.querySelector('.notification-popup-time');

                   // Extract data from the source `item`
                   const sourceIcon = item.querySelector('.notification-icon')?.innerHTML || '🔔';
                   const sourceTitle = item.querySelector('.notification-title')?.textContent || 'ไม่มีหัวข้อ';
                   const sourceTime = item.querySelector('.notification-time')?.textContent || '';
                   const isUnread = item.classList.contains('unread');

                   if (isUnread) popupItem.classList.add('unread');
                   iconEl.innerHTML = sourceIcon;
                   titleEl.textContent = sourceTitle;
                   timeEl.textContent = sourceTime;

                   list.appendChild(clone);
                });
            } else {
                list.innerHTML = `<div class="notification-empty-state"><p>ยังไม่มีการแจ้งเตือนใหม่</p></div>`;
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            list.innerHTML = `<div class="notification-empty-state"><p>ไม่สามารถโหลดการแจ้งเตือนได้</p></div>`;
        }
    }

    hideNotificationPopup() {
        if (!this.dom.notificationPopup) return;

        this.dom.notificationPopup.classList.remove('show');
        this.dom.notificationOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Fetch unread notification count
    async fetchUnreadCount() {
        try {
            const response = await fetch('../../notification/notifications.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const unreadCount = doc.querySelectorAll('.notification-item.unread').length;
            this.updateNotificationBadge(unreadCount);
        } catch (error) {
            console.error('Could not fetch unread notification count:', error);
            this.updateNotificationBadge(0); // Hide badge on error
        }
    }

    updateNotificationBadge(count) {
        if (!this.dom.notificationBadge) return;

        this.dom.notificationBadge.textContent = count > 9 ? '9+' : count;
        this.dom.notificationBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    // API simulation
    async processRedemption(itemType, pointsCost) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% success rate
                    resolve({ success: true, item: itemType });
                } else {
                    reject(new Error('Redemption failed'));
                }
            }, 1500);
        });
    }

    // Animation methods
    animateOnLoad() {
        const elements = document.querySelectorAll('.member-info, .benefits-section, .tier-comparison, .special-offers, .activity-section');
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('fade-in-up');
            }, index * 200);
        });
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    showNotification(message, type = 'info') {
        if (!this.dom.notificationTemplate) {
            console.error('Notification template not found!');
            return;
        }
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());

        // Create new notification
        const notificationClone = this.dom.notificationTemplate.content.cloneNode(true);
        const notificationElement = notificationClone.querySelector('.notification');
        
        if (!notificationElement) return;

        notificationElement.className = `notification ${type}`;
        notificationElement.textContent = message;
        document.body.appendChild(notificationElement);
        
        // Show notification
        setTimeout(() => {
            notificationElement.classList.add('show');
        }, 10);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notificationElement.classList.remove('show');
            notificationElement.addEventListener('transitionend', () => notificationElement.remove(), { once: true });
        }, 3000);
    }

    // Save member data to localStorage
    saveMemberData() {
        localStorage.setItem('memberData', JSON.stringify(this.memberData));
    }

    // Modal methods
    showModal(title, content, buttonText = 'ตกลง', onAction = null) {
        if (!this.dom.modal) return;

        this.dom.modalTitle.textContent = title;
        this.dom.modalBody.innerHTML = content;
        
        // Re-create the button to remove old event listeners
        const newActionButton = this.dom.modalActionButton.cloneNode(true);
        newActionButton.textContent = buttonText;
        this.dom.modalActionButton.parentNode.replaceChild(newActionButton, this.dom.modalActionButton);
        this.dom.modalActionButton = newActionButton;

        const actionHandler = onAction ? onAction : () => this.hideModal();
        this.dom.modalActionButton.addEventListener('click', actionHandler, { once: true });

        this.dom.modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    hideModal() {
        if (!this.dom.modal) return;

        this.dom.modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Analytics tracking
    trackEvent(eventName, properties = {}) {
        // In real app, send to analytics service
        console.log('Analytics Event:', eventName, properties);
    }

    // Cleanup method
    destroy() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
        }
    }

    // Initialize dashboard
    static init() {
        return new MemberDashboard();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = MemberDashboard.init();
    
    // Save dashboard instance globally for debugging
    window.memberDashboard = dashboard;
    
    // Save member data before page unload
    window.addEventListener('beforeunload', () => {
        dashboard.saveMemberData();
    });
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause timers
        if (window.memberDashboard && window.memberDashboard.countdownTimer) {
            clearInterval(window.memberDashboard.countdownTimer);
        }
    } else {
        // Page is visible, resume timers
        if (window.memberDashboard) {
            window.memberDashboard.initializeCountdown();
        }
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemberDashboard;
}