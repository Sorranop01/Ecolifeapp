document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const backButton = document.getElementById('backButton');
    const orderIdDisplay = document.getElementById('orderIdDisplay');
    const taxForm = document.getElementById('tax-invoice-form');
    const taxpayerTypeRadios = document.querySelectorAll('input[name="taxpayer-type"]');
    const companyNameGroup = document.getElementById('company-name-group');
    const companyNameInput = document.getElementById('company-name');
    const taxpayerNameInput = document.getElementById('taxpayer-name');
    const taxIdInput = document.getElementById('tax-id');
    const taxAddressInput = document.getElementById('tax-address');
    const saveInfoCheckbox = document.getElementById('save-info-checkbox');

    // --- Constants ---
    const TAX_INFO_STORAGE_KEY = 'ecolife_tax_invoice_data';

    
    // --- Get Order ID from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (orderId) {
        orderIdDisplay.textContent = `#${orderId}`;
    } else {
        document.getElementById('orderInfo').innerHTML = 'ไม่พบหมายเลขคำสั่งซื้อ';
        taxForm.querySelector('.submit-button').disabled = true;
    }

    // --- Functions for LocalStorage ---
    function saveTaxInfo() {
        const infoToSave = {
            taxpayerType: document.querySelector('input[name="taxpayer-type"]:checked').value,
            companyName: companyNameInput.value,
            taxpayerName: taxpayerNameInput.value,
            taxId: taxIdInput.value,
            taxAddress: taxAddressInput.value,
        };
        localStorage.setItem(TAX_INFO_STORAGE_KEY, JSON.stringify(infoToSave));
        console.log('Tax info saved to localStorage.');
    }

    function loadSavedTaxInfo() {
        const savedInfoJSON = localStorage.getItem(TAX_INFO_STORAGE_KEY);
        if (!savedInfoJSON) {
            saveInfoCheckbox.checked = false; // Uncheck if no data is saved
            return;
        }

        try {
            const savedInfo = JSON.parse(savedInfoJSON);
            
            const typeRadio = document.querySelector(`input[name="taxpayer-type"][value="${savedInfo.taxpayerType}"]`);
            if (typeRadio) {
                typeRadio.checked = true;
                typeRadio.dispatchEvent(new Event('change')); // Trigger change to show/hide company field
            }

            if (savedInfo.companyName) companyNameInput.value = savedInfo.companyName;
            taxpayerNameInput.value = savedInfo.taxpayerName || '';
            taxIdInput.value = savedInfo.taxId || '';
            taxAddressInput.value = savedInfo.taxAddress || '';
            
            saveInfoCheckbox.checked = true;
        } catch (e) {
            console.error('Error parsing saved tax info:', e);
            clearSavedTaxInfo(); // Clear corrupted data
        }
    }

    function clearSavedTaxInfo() {
        localStorage.removeItem(TAX_INFO_STORAGE_KEY);
        console.log('Saved tax info cleared from localStorage.');
    }

    // --- Event Listeners ---
    backButton.addEventListener('click', () => {
        window.history.back();
    });

    taxpayerTypeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.value === 'company') {
                companyNameGroup.style.display = 'block';
                companyNameGroup.querySelector('input').required = true;
            } else {
                companyNameGroup.style.display = 'none';
                companyNameGroup.querySelector('input').required = false;
            }
        });
    });

    taxForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const submitButton = taxForm.querySelector('.submit-button');
        const originalButtonText = submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = 'กำลังส่ง...';

        // Simulate API call
        console.log('Submitting tax invoice request for order:', orderId);
        const formData = new FormData(taxForm);
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        setTimeout(() => {
            if (saveInfoCheckbox.checked) {
                saveTaxInfo();
            } else {
                clearSavedTaxInfo();
            }

            showToast('ส่งคำขอใบกำกับภาษีสำเร็จแล้ว');
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;

            // Redirect back to order history or dashboard after a delay
            setTimeout(() => {
                // The path is relative from /member/tax-invoice/ to /member/order-history/
                window.location.href = '../order-history/order-history.html';
            }, 2000);
        }, 1500);
    });

    // --- Toast Notification Logic ---
    let toastTimeout;
    function showToast(message) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add('show');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // --- Initial Load ---
    loadSavedTaxInfo();
});