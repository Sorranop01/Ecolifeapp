document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 My Coupons Page Initializing...');

    // --- MOCK DATA ---
    const MOCK_COUPONS = {
        available: [
            { id: 'HEALTHY20', type: 'discount', valueMain: '20%', valueDesc: 'ลดสูงสุด 300 บาท', label: 'อาหารเพื่อสุขภาพ', conditions: ['ซื้อขั้นต่ำ 1,500 บาท', 'สมาชิก Premium'], expiry: '25 ก.ค. 2025', status: 'available' },
            { id: 'FREESHIP', type: 'shipping', valueMain: 'ฟรี', valueDesc: 'ทุกออเดอร์', label: 'ส่งถึงบ้าน 40km', conditions: ['ไม่มีขั้นต่ำ', 'ในเขต กทม.'], expiry: '31 ก.ค. 2025', status: 'available' },
            { id: 'CASHBACK15', type: 'cashback', valueMain: '15%', valueDesc: 'คืนเป็นแต้ม', label: 'ออกกำลังกาย + อาหาร', conditions: ['คืนสูงสุด 750 แต้ม', 'แพ็คเกจครบชุด'], expiry: '15 ส.ค. 2025', status: 'available' },
            { id: 'NEWBIE50', type: 'discount', valueMain: '50฿', valueDesc: 'ส่วนลดทันที', label: 'สำหรับสมาชิกใหม่', conditions: ['ไม่มีขั้นต่ำ'], expiry: '31 ธ.ค. 2024', status: 'available' },
        ],
        used: [
            { id: 'USED01', type: 'discount', valueMain: '100฿', valueDesc: 'ส่วนลด', label: 'สินค้าทั่วไป', conditions: ['ซื้อครบ 800 บาท'], expiry: '20 มิ.ย. 2024', status: 'used' },
        ],
        expired: [
            { id: 'EXPIRED01', type: 'shipping', valueMain: 'ฟรี', valueDesc: 'ทุกออเดอร์', label: 'ส่งฟรีทั่วไทย', conditions: ['ซื้อครบ 1,200 บาท'], expiry: '31 พ.ค. 2024', status: 'expired' },
            { id: 'EXPIRED02', type: 'discount', valueMain: '10%', valueDesc: 'ลดทันที', label: 'เครื่องดื่มสุขภาพ', conditions: ['ไม่มีขั้นต่ำ'], expiry: '15 มิ.ย. 2024', status: 'expired' },
        ]
    };

    // --- DOM ELEMENTS ---
    const DOM = {
        backButton: document.getElementById('backButton'),
        menuButton: document.getElementById('menuButton'),
        discoverCouponsButton: document.getElementById('discoverCouponsButton'),
        discoverCouponsEmptyButton: document.getElementById('discoverCouponsEmptyButton'),
        filterTabs: document.getElementById('filterTabs'),
        couponsGrid: document.getElementById('couponsGrid'),
        loadingState: document.getElementById('loadingState'),
        emptyState: document.getElementById('emptyState'),
        availableCouponsCount: document.getElementById('availableCouponsCount'),
        successModal: document.getElementById('successModal'),
        modalBackdrop: document.getElementById('modalBackdrop'),
        closeModalButton: document.getElementById('closeModalButton'),
        goToShoppingButton: document.getElementById('goToShoppingButton'),
        successMessage: document.getElementById('successMessage'),
        couponCardTemplate: document.getElementById('couponCardTemplate'),
        fabButton: document.getElementById('fabButton'),
    };

    // --- STATE ---
    let currentFilter = 'available';

    // --- ICONS ---
    const ICONS = {
        discount: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
        shipping: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
        cashback: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>`,
    };

    // --- RENDER FUNCTIONS ---

    function createCouponCard(coupon) {
        const clone = DOM.couponCardTemplate.content.cloneNode(true);
        const card = clone.querySelector('.coupon-card');
        const header = clone.querySelector('.coupon-header');
        const useButton = clone.querySelector('[data-coupon-action="use"]');
        const statusBadge = clone.querySelector('.status-badge');

        card.dataset.couponId = coupon.id;
        card.classList.add(coupon.status);
        header.classList.add(`${coupon.type}-coupon`);

        clone.querySelector('[data-coupon-svg="typeIcon"]').innerHTML = ICONS[coupon.type] || ICONS.discount;
        clone.querySelector('[data-coupon-text="type"]').textContent = { discount: 'ส่วนลดพิเศษ', shipping: 'จัดส่งฟรี', cashback: 'คืนเงิน' }[coupon.type];
        clone.querySelector('[data-coupon-text="valueMain"]').textContent = coupon.valueMain;
        clone.querySelector('[data-coupon-text="valueDesc"]').textContent = coupon.valueDesc;
        clone.querySelector('[data-coupon-text="label"]').textContent = coupon.label;
        clone.querySelector('[data-coupon-text="expiry"]').textContent = `หมดอายุ ${coupon.expiry}`;

        const conditionsContainer = clone.querySelector('[data-coupon-container="conditions"]');
        coupon.conditions.forEach(text => {
            const tag = document.createElement('span');
            tag.className = 'condition-tag';
            tag.textContent = text;
            conditionsContainer.appendChild(tag);
        });

        if (coupon.status !== 'available') {
            useButton.disabled = true;
            useButton.textContent = coupon.status === 'used' ? 'ใช้แล้ว' : 'หมดอายุ';
            statusBadge.textContent = coupon.status === 'used' ? 'ใช้แล้ว' : 'หมดอายุ';
            statusBadge.classList.remove('hidden');
        }

        return clone;
    }

    function renderCoupons(filter) {
        DOM.couponsGrid.innerHTML = '';
        DOM.loadingState.classList.remove('hidden');
        DOM.emptyState.classList.add('hidden');

        setTimeout(() => {
            const couponsToRender = MOCK_COUPONS[filter] || [];
            DOM.loadingState.classList.add('hidden');

            if (couponsToRender.length === 0) {
                DOM.emptyState.classList.remove('hidden');
            } else {
                couponsToRender.forEach(coupon => {
                    const card = createCouponCard(coupon);
                    DOM.couponsGrid.appendChild(card);
                });
            }
        }, 500); // Simulate network delay
    }

    function updateCounts() {
        Object.keys(MOCK_COUPONS).forEach(filter => {
            const count = MOCK_COUPONS[filter].length;
            const badge = DOM.filterTabs.querySelector(`[data-count-for="${filter}"]`);
            if (badge) {
                badge.textContent = count;
            }
        });
        DOM.availableCouponsCount.textContent = MOCK_COUPONS.available.length;
    }

    // --- ACTION FUNCTIONS ---

    function goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '../dashboard/member-dashboard.html';
        }
    }

    function handleFilterClick(e) {
        const button = e.target.closest('.filter-tab');
        if (!button) return;

        currentFilter = button.dataset.filter;

        DOM.filterTabs.querySelector('.active').classList.remove('active');
        button.classList.add('active');

        renderCoupons(currentFilter);
    }

    function handleCouponAction(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.dataset.couponAction;
        const card = button.closest('.coupon-card');
        const couponId = card.dataset.couponId;

        if (action === 'use') {
            useCoupon(couponId, button);
        } else if (action === 'share') {
            shareCoupon(couponId);
        }
    }

    function useCoupon(couponId, button) {
        console.log(`Using coupon: ${couponId}`);
        button.textContent = 'กำลังใช้...';
        button.disabled = true;

        setTimeout(() => {
            DOM.successMessage.textContent = `ใช้คูปอง ${couponId} สำเร็จ!`;
            showModal();
            button.textContent = 'ใช้คูปอง';
            button.disabled = false;
        }, 1000);
    }

    async function shareCoupon(couponId) {
        const coupon = [...MOCK_COUPONS.available, ...MOCK_COUPONS.used, ...MOCK_COUPONS.expired].find(c => c.id === couponId);
        const shareData = {
            title: 'คูปองสุดพิเศษจาก EcoLife!',
            text: `รับคูปอง "${coupon.label}" ที่ EcoLife!`,
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                console.log('Coupon shared successfully');
            } else {
                // Fallback for browsers that don't support Web Share API
                navigator.clipboard.writeText(shareData.url);
                alert('คัดลอกลิงก์แล้ว! แชร์ให้เพื่อนของคุณได้เลย');
            }
        } catch (err) {
            console.error('Error sharing coupon:', err);
        }
    }

    function discoverCoupons() {
        window.location.href = '../../promotion/list/promotions.html';
    }

    function openCouponMenu() {
        alert('เมนูเพิ่มเติม (ยังไม่ถูกสร้าง)');
    }

    function showQuickActions() {
        alert('ปุ่มลัด (ยังไม่ถูกสร้าง)');
    }

    // --- MODAL FUNCTIONS ---

    function showModal() {
        DOM.successModal.classList.remove('hidden');
    }

    function closeModal() {
        DOM.successModal.classList.add('hidden');
    }

    function goToShopping() {
        closeModal();
        window.location.href = '../../Product/listing/product-listing.html';
    }

    // --- EVENT LISTENERS ---

    function setupEventListeners() {
        if (DOM.backButton) DOM.backButton.addEventListener('click', goBack);
        if (DOM.menuButton) DOM.menuButton.addEventListener('click', openCouponMenu);
        if (DOM.discoverCouponsButton) DOM.discoverCouponsButton.addEventListener('click', discoverCoupons);
        if (DOM.discoverCouponsEmptyButton) DOM.discoverCouponsEmptyButton.addEventListener('click', discoverCoupons);
        if (DOM.filterTabs) DOM.filterTabs.addEventListener('click', handleFilterClick);
        if (DOM.couponsGrid) DOM.couponsGrid.addEventListener('click', handleCouponAction);
        if (DOM.fabButton) DOM.fabButton.addEventListener('click', showQuickActions);

        // Modal listeners
        if (DOM.modalBackdrop) DOM.modalBackdrop.addEventListener('click', closeModal);
        if (DOM.closeModalButton) DOM.closeModalButton.addEventListener('click', closeModal);
        if (DOM.goToShoppingButton) DOM.goToShoppingButton.addEventListener('click', goToShopping);

        console.log('✅ Event Listeners are set up.');
    }

    // --- INITIALIZATION ---

    function init() {
        setupEventListeners();
        updateCounts();
        renderCoupons(currentFilter);
        console.log('✅ My Coupons Page Initialized Successfully!');
    }

    init();
});