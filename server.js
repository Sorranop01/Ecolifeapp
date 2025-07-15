const express = require('express');
const path = require('path');
const omise = require('omise');
require('dotenv').config(); // 1. เรียกใช้ dotenv

const app = express();
app.use(express.json()); // Middleware สำหรับอ่านข้อมูล JSON จาก request

// --- ตั้งค่า Omise ---
// 2. ดึง Secret Key จากไฟล์ .env
const omiseClient = omise({
    'secretKey': process.env.OMISE_SECRET_KEY,
    'omiseVersion': '2019-05-29'
});

// --- 2. สร้าง API Endpoint สำหรับรับ Token และตัดบัตร ---
app.post('/api/create-charge', async (req, res) => {
    // รับข้อมูลที่ส่งมาจาก Frontend (payment-card.js)
    const { omiseToken, amount, currency, description } = req.body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!omiseToken || !amount || !currency) {
        return res.status(400).json({ message: 'ข้อมูลสำหรับชำระเงินไม่ครบถ้วน' });
    }

    try {
        // 3. ใช้ Secret Key และ Token สั่งสร้างรายการตัดบัตร (Charge)
        const charge = await omiseClient.charges.create({
            amount: amount,         // จำนวนเงิน (หน่วยเป็นสตางค์)
            currency: currency,     // สกุลเงิน (thb)
            card: omiseToken,       // Token ที่ได้จาก Frontend
            description: description
        });

        console.log('สร้างรายการตัดบัตรสำเร็จ:', charge);

        // 4. ส่งผลลัพธ์กลับไปให้ Frontend
        res.json({
            status: charge.status, // เช่น 'successful', 'failed', 'pending'
            failure_code: charge.failure_code,
            failure_message: charge.failure_message
        });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดจาก Omise API:', error);
        res.status(500).json({
            status: 'failed',
            failure_message: error.message
        });
    }
});

// --- 5. ตั้งค่าให้เซิร์ฟเวอร์สามารถเปิดไฟล์ HTML, CSS, JS ของคุณได้ ---
// ทำให้เราสามารถทดสอบทุกอย่างร่วมกันได้ง่ายๆ
const staticPath = path.join(__dirname, 'pages');
app.use(express.static(staticPath));

// --- 6. เริ่มการทำงานของเซิร์ฟเวอร์ ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`เซิร์ฟเวอร์พร้อมทำงานแล้ว!`);
    console.log(`เปิดเว็บของคุณที่ -> http://localhost:${PORT}/checkout/steps/payment-card.html`);
});