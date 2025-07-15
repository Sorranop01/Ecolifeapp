document.addEventListener('DOMContentLoaded', () => {
    // --- MOCK DATA ---
    let MOCK_ADDRESSES = [
        { id: 1, name: 'คุณสมศรี ใจดี (บ้าน)', phone: '081-234-5678', line1: '123/45 หมู่ 6 ถ.สุขุมวิท', line2: 'บางนา, บางนา', province: 'กรุงเทพมหานคร', postalCode: '10260', isDefault: true },
        { id: 2, name: 'คุณสมศรี ใจดี (ที่ทำงาน)', phone: '081-234-5678', line1: '99 อาคารสาทร ทาวเวอร์ ชั้น 20', line2: 'สีลม, บางรัก', province: 'กรุงเทพมหานคร', postalCode: '10500', isDefault: false },
    ];

    // --- DOM ELEMENTS ---
    const DOM = {
        backButton: document.getElementById('backButton'),
        addNewAddressBtn: document.getElementById('addNewAddressBtn'),
        addressList: document.getElementById('addressList'),
        emptyState: document.getElementById('emptyState'),
        addressCardTemplate: document.getElementById('addressCardTemplate'),
        // Modals
        addressModal: document.getElementById('addressModal'),
        deleteConfirmModal: document.getElementById('deleteConfirmModal'),
        // Form
        addressForm: document.getElementById('addressForm'),
        modalTitle: document.getElementById('modalTitle'),
        addressId: document.getElementById('addressId'),
        fullName: document.getElementById('fullName'),
        phone: document.getElementById('phone'),
        addressLine1: document.getElementById('addressLine1'),
        addressLine2: document.getElementById('addressLine2'),
        province: document.getElementById('province'),
        postalCode: document.getElementById('postalCode'),
        isDefault: document.getElementById('isDefault'),
        // Toast
        toast: document.getElementById('toast'),
        toastIcon: document.getElementById('toastIcon'),
        toastMessage: document.getElementById('toastMessage'),
    };

    let addressToDeleteId = null;

    // --- RENDER FUNCTIONS ---
    function renderAddresses() {
        DOM.addressList.innerHTML = '';
        if (MOCK_ADDRESSES.length === 0) {
            DOM.emptyState.style.display = 'block';
            return;
        }
        DOM.emptyState.style.display = 'none';

        MOCK_ADDRESSES.forEach(addr => {
            const card = DOM.addressCardTemplate.content.cloneNode(true);
            const cardElement = card.querySelector('.address-card');
            
            cardElement.dataset.id = addr.id;
            if (addr.isDefault) cardElement.classList.add('default');
            
            card.querySelector('.user-name').textContent = addr.name;
            card.querySelector('.phone').textContent = addr.phone;
            card.querySelector('.address-lines').textContent = `${addr.line1}, ${addr.line2}, ${addr.province} ${addr.postalCode}`;

            // Event listeners are now handled by delegation in setupEventListeners
            DOM.addressList.appendChild(card);
        });
    }

    // --- MODAL & FORM HANDLING ---
    function showAddressModal(id = null) {
        DOM.addressForm.reset();
        if (id) {
            const addr = MOCK_ADDRESSES.find(a => a.id === id);
            DOM.modalTitle.textContent = 'แก้ไขที่อยู่';
            DOM.addressId.value = addr.id;
            DOM.fullName.value = addr.name;
            DOM.phone.value = addr.phone;
            DOM.addressLine1.value = addr.line1;
            DOM.addressLine2.value = addr.line2;
            DOM.province.value = addr.province;
            DOM.postalCode.value = addr.postalCode;
            DOM.isDefault.checked = addr.isDefault;
        } else {
            DOM.modalTitle.textContent = 'เพิ่มที่อยู่ใหม่';
            DOM.addressId.value = '';
        }
        DOM.addressModal.style.display = 'flex';
    }

    function hideModal(modal) {
        modal.style.display = 'none';
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const id = parseInt(DOM.addressId.value);
        const newAddressData = {
            name: DOM.fullName.value,
            phone: DOM.phone.value,
            line1: DOM.addressLine1.value,
            line2: DOM.addressLine2.value,
            province: DOM.province.value,
            postalCode: DOM.postalCode.value,
            isDefault: DOM.isDefault.checked,
        };

        if (newAddressData.isDefault) {
            MOCK_ADDRESSES.forEach(addr => addr.isDefault = false);
        }

        if (id) { // Editing
            const index = MOCK_ADDRESSES.findIndex(a => a.id === id);
            MOCK_ADDRESSES[index] = { ...MOCK_ADDRESSES[index], ...newAddressData };
        } else { // Adding
            newAddressData.id = Date.now();
            MOCK_ADDRESSES.push(newAddressData);
        }

        // If no address is default, make the first one default
        if (!MOCK_ADDRESSES.some(addr => addr.isDefault) && MOCK_ADDRESSES.length > 0) {
            MOCK_ADDRESSES[0].isDefault = true;
        }

        renderAddresses();
        hideModal(DOM.addressModal);
        showToast('บันทึกที่อยู่สำเร็จแล้ว', 'success');
    }

    // --- ADDRESS ACTIONS ---
    function setDefaultAddress(id) {
        MOCK_ADDRESSES.forEach(addr => {
            addr.isDefault = (addr.id === id);
        });
        renderAddresses();
        showToast('ตั้งเป็นที่อยู่หลักสำเร็จ', 'success');
    }

    function showDeleteConfirmation(id) {
        addressToDeleteId = id;
        DOM.deleteConfirmModal.style.display = 'flex';
    }

    function deleteAddress() {
        if (addressToDeleteId === null) return;
        MOCK_ADDRESSES = MOCK_ADDRESSES.filter(addr => addr.id !== addressToDeleteId);
        
        // If the deleted address was default, make the first one default
        if (!MOCK_ADDRESSES.some(addr => addr.isDefault) && MOCK_ADDRESSES.length > 0) {
            MOCK_ADDRESSES[0].isDefault = true;
        }

        renderAddresses();
        hideModal(DOM.deleteConfirmModal);
        addressToDeleteId = null;
        showToast('ลบที่อยู่สำเร็จ', 'error');
    }

    // --- UTILITY FUNCTIONS ---
    function showToast(message, type = 'success') {
        if (!DOM.toast) return;
        const icons = { success: '✅', error: '🗑️', info: 'ℹ️' };
        DOM.toastIcon.textContent = icons[type] || 'ℹ️';
        DOM.toastMessage.textContent = message;
        
        DOM.toast.className = 'toast show';
        setTimeout(() => {
            DOM.toast.className = 'toast';
        }, 3000);
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        DOM.backButton.addEventListener('click', () => window.history.back());
        DOM.addNewAddressBtn.addEventListener('click', () => showAddressModal());
        DOM.addressForm.addEventListener('submit', handleFormSubmit);

        // Event Delegation for Address List
        DOM.addressList.addEventListener('click', (e) => {
            const target = e.target;
            const card = target.closest('.address-card');
            if (!card) return;

            const addressId = parseInt(card.dataset.id, 10);

            if (target.matches('.edit-btn')) {
                showAddressModal(addressId);
            } else if (target.matches('.delete-btn')) {
                showDeleteConfirmation(addressId);
            } else if (target.matches('.set-default-btn')) {
                setDefaultAddress(addressId);
            }
        });

        // Modal close buttons
        DOM.addressModal.querySelector('.modal-close').addEventListener('click', () => hideModal(DOM.addressModal));
        DOM.deleteConfirmModal.querySelector('.cancel-btn').addEventListener('click', () => hideModal(DOM.deleteConfirmModal));
        DOM.deleteConfirmModal.querySelector('.confirm-delete-btn').addEventListener('click', deleteAddress);
    }

    // --- INITIALIZATION ---
    function init() {
        renderAddresses();
        setupEventListeners();
    }

    init();
});