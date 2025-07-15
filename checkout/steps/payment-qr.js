document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selections ---
    const backButton = document.getElementById('backButton');
    const finalPriceEl = document.getElementById('finalPrice');
    const accountNumberEl = document.getElementById('accountNumber');
    const copyBtn = document.getElementById('copyBtn');
    const uploadSlipBtn = document.getElementById('uploadSlipBtn');
    const slipUploader = document.getElementById('slipUploader');
    const slipPreview = document.getElementById('slipPreview');
    const slipPreviewImage = document.getElementById('slipPreviewImage');
    const slipFileName = document.getElementById('slipFileName');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');

    let finalTotal = 0;

    // --- Initial Setup ---
    function loadCheckoutData() {
        // --- ตั้งค่าข้อมูลบัญชีของคุณ ---
        const scbAccountNumber = '381-236078-3'; // ใส่เลขบัญชี SCB 10 หลักของคุณที่นี่
        accountNumberEl.textContent = scbAccountNumber;

        const checkoutDataJSON = localStorage.getItem('ecolife_checkout_data');
        if (checkoutDataJSON) {
            const checkoutData = JSON.parse(checkoutDataJSON);
            finalTotal = checkoutData.summary?.finalTotal || 0;
            const formattedPrice = `฿${finalTotal.toFixed(2)}`;

            // อัปเดตยอดที่ต้องชำระในแถบสรุปด้านล่าง
            finalPriceEl.textContent = formattedPrice;

        } else {
            // Handle case where user lands here directly
            finalPriceEl.textContent = '฿0.00';
            confirmPaymentBtn.disabled = true;
            confirmPaymentBtn.textContent = 'ไม่พบข้อมูล';
            alert('ไม่พบข้อมูลการสั่งซื้อ กรุณากลับไปที่ตะกร้าสินค้า');
        }
    }

    // --- Event Listeners ---
    backButton.addEventListener('click', () => {
        window.history.back();
    });

    copyBtn.addEventListener('click', () => {
        const accountNumber = accountNumberEl.textContent;
        navigator.clipboard.writeText(accountNumber).then(() => {
            copyBtn.textContent = 'คัดลอกแล้ว!';
            setTimeout(() => {
                copyBtn.textContent = 'คัดลอก';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('ไม่สามารถคัดลอกได้');
        });
    });

    uploadSlipBtn.addEventListener('click', () => {
        slipUploader.click();
    });

    slipUploader.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                slipPreviewImage.src = e.target.result;
            };
            reader.readAsDataURL(file);

            slipFileName.textContent = file.name;
            slipPreview.style.display = 'flex';
            confirmPaymentBtn.disabled = false;
        }
    });

    confirmPaymentBtn.addEventListener('click', () => {
        // Simulate payment confirmation
        confirmPaymentBtn.disabled = true;
        confirmPaymentBtn.textContent = 'กำลังตรวจสอบ...';

        setTimeout(() => {
            // On success:            
            // 1. Generate a mock order ID for the success page
            const mockOrderId = `ECO${Math.floor(100000 + Math.random() * 900000)}`;

            // 2. Clear cart and checkout data from storage
            localStorage.removeItem('ecolife_cart');
            localStorage.removeItem('ecolife_checkout_data');

            // 3. Redirect to the success page, passing the new order ID
            window.location.href = `../../orders/sccess/order-success.html?orderId=${mockOrderId}`;
        }, 2000);
    });

    // --- Initialize ---
    loadCheckoutData();
});