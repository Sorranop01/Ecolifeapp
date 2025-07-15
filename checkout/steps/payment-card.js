document.addEventListener('DOMContentLoaded', () => {
    // --- 2. ตั้งค่า Public Key ของคุณที่นี่ ---
    Omise.setPublicKey('pkey_live_xxxxxxxxxxxxxxxxxx'); // <--- ใส่ Live Public Key ของคุณที่นี่

    // --- DOM Element Selections ---
    const paymentForm = document.getElementById('paymentForm');
    const payBtn = document.getElementById('payBtn');
    const backButton = document.getElementById('backButton');

    // Form Inputs
    const cardNumberInput = document.getElementById('cardNumber');
    const cardNameInput = document.getElementById('cardName');
    const cardExpiryInput = document.getElementById('cardExpiry');
    const cardCvvInput = document.getElementById('cardCvv');

    // Visual Card Elements
    const visualCardNumber = document.getElementById('visualCardNumber');
    const visualCardName = document.getElementById('visualCardName');
    const visualCardExpiry = document.getElementById('visualCardExpiry');
    const finalPriceEl = document.getElementById('finalPrice');

    let amountToPay = 0; // ตัวแปรสำหรับเก็บยอดเงิน (หน่วยสตางค์) ที่จะใช้ตัดบัตร

    // --- Initial Setup ---
    // ดึงข้อมูลสรุปยอดจากตะกร้าสินค้าที่บันทึกไว้ใน localStorage
    const checkoutDataJSON = localStorage.getItem('ecolife_checkout_data');

    if (checkoutDataJSON) {
        const checkoutData = JSON.parse(checkoutDataJSON);
        const finalTotal = checkoutData.summary?.finalTotal || 0;

        // แปลงยอดเงิน (บาท) เป็นหน่วยสตางค์สำหรับ Omise API
        amountToPay = Math.round(finalTotal * 100);

        // อัปเดตยอดที่ต้องชำระบนหน้าเว็บ
        finalPriceEl.textContent = `฿${finalTotal.toFixed(2)}`;
    } else {
        // กรณีที่ผู้ใช้เข้ามาหน้านี้โดยตรง ไม่ผ่านตะกร้า
        finalPriceEl.textContent = '฿0.00';
        payBtn.disabled = true;
        payBtn.textContent = 'ไม่พบข้อมูล';
        alert('ไม่พบข้อมูลการสั่งซื้อ กรุณากลับไปที่ตะกร้าสินค้า');
    }

    // --- Event Listeners ---
    backButton.addEventListener('click', () => {
        window.history.back();
    });

    // --- Input Formatting and Visual Updates ---

    // Format card number with spaces
    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = value;
        visualCardNumber.textContent = value || '•••• •••• •••• ••••';
    });

    // Format expiry date with a slash
    cardExpiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
        visualCardExpiry.textContent = value || 'MM/YY';
    });

    // Update visual card name
    cardNameInput.addEventListener('input', (e) => {
        visualCardName.textContent = e.target.value || 'ชื่อ-นามสกุล';
    });

    // --- Omise Payment Logic ---

    payBtn.addEventListener('click', (event) => {
        event.preventDefault(); // ป้องกันการ submit ฟอร์มตามปกติ

        // 3. เตรียมข้อมูลบัตรจากฟอร์มเพื่อสร้าง Token
        const cardData = {
            name: cardNameInput.value,
            number: cardNumberInput.value.replace(/\s/g, ''), // ลบช่องว่างออก
            security_code: cardCvvInput.value,
        };

        // แยกเดือนและปีออกจาก MM/YY
        const expiry = cardExpiryInput.value.split('/');
        if (expiry.length === 2) {
            cardData.expiration_month = expiry[0];
            // Omise ต้องการปีเป็น YYYY (เช่น 2025)
            cardData.expiration_year = `20${expiry[1]}`;
        }

        // ปิดปุ่มเพื่อป้องกันการกดซ้ำ
        payBtn.disabled = true;
        payBtn.textContent = 'กำลังดำเนินการ...';

        // 4. เรียกใช้ Omise.createToken เพื่อสร้าง Token
        Omise.createToken('card', cardData, (statusCode, response) => {
            if (statusCode === 200) {
                // สร้าง Token สำเร็จ
                console.log('Omise Token:', response.id);
                // 5. ส่ง Token ไปยัง Backend ของคุณเพื่อตัดเงิน
                sendTokenToBackend(response.id);
            } else {
                // สร้าง Token ไม่สำเร็จ
                console.error('Error:', response.message);
                alert(`เกิดข้อผิดพลาด: ${response.message}`);
                // เปิดปุ่มให้ลองอีกครั้ง
                payBtn.disabled = false;
                payBtn.textContent = 'ชำระเงิน';
            }
        });
    });

    /**
     * ฟังก์ชันสำหรับส่ง Token ไปยัง Backend ของคุณ
     * @param {string} omiseToken - Token ที่ได้จาก Omise
     */
    function sendTokenToBackend(omiseToken) {
        // ตัวอย่างการใช้ fetch API เพื่อส่งข้อมูล
        // คุณต้องสร้าง Endpoint นี้ที่ Backend ของคุณ
        const backendEndpoint = '/api/create-charge';

        if (amountToPay <= 0) {
            alert('ยอดชำระเงินไม่ถูกต้อง');
            payBtn.disabled = false;
            payBtn.textContent = 'ชำระเงิน';
            return;
        }

        fetch(backendEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                omiseToken: omiseToken,
                amount: amountToPay,
                currency: 'thb',
                description: 'Order from EcoLife App'
            }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'successful' || data.status === 'paid') {
                // ชำระเงินสำเร็จ                
                // 1. Generate a mock order ID for the success page
                const mockOrderId = `ECO${Math.floor(100000 + Math.random() * 900000)}`;

                // 2. ล้างข้อมูลตะกร้าและข้อมูลชำระเงินหลังจากทำรายการสำเร็จ
                localStorage.removeItem('ecolife_cart');
                localStorage.removeItem('ecolife_checkout_data');
                
                // 3. Redirect to the success page, passing the new order ID
                // The path is relative from /checkout/steps/ to /orders/success/
                window.location.href = `../../orders/success/order-success.html?orderId=${mockOrderId}`;
            } else {
                // ชำระเงินไม่สำเร็จ
                alert('การชำระเงินล้มเหลว: ' + (data.failure_message || 'โปรดตรวจสอบข้อมูลบัตรและลองอีกครั้ง'));
                payBtn.disabled = false;
                payBtn.textContent = 'ชำระเงิน';
            }
        })
        .catch(error => {
            console.error('Backend Error:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
            payBtn.disabled = false;
            payBtn.textContent = 'ชำระเงิน';
        });
    }
});