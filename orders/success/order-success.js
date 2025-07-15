document.addEventListener('DOMContentLoaded', () => {
    const orderIdDisplay = document.getElementById('orderIdDisplay');
    const trackOrderBtn = document.getElementById('trackOrderBtn');
    const requestTaxInvoiceBtn = document.getElementById('requestTaxInvoiceBtn');
    const backToHomeBtn = document.getElementById('backToHomeBtn');

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (orderId) {
        orderIdDisplay.textContent = `#${orderId}`;
    } else {
        orderIdDisplay.textContent = 'N/A';
        trackOrderBtn.disabled = true;
        requestTaxInvoiceBtn.disabled = true;
    }

    trackOrderBtn.addEventListener('click', () => {
        if (orderId) {
            // The path is relative from /orders/success/ to /orders/tracking/
            window.location.href = `../tracking/order-tracking.html?order=${orderId}`;
        }
    });

    requestTaxInvoiceBtn.addEventListener('click', () => {
        if (orderId) {
            // The path is relative from /orders/success/ to /member/tax-invoice/
            window.location.href = `../../member/tax-invoice/request-tax-invoice.html?orderId=${orderId}`;
        }
    });

    backToHomeBtn.addEventListener('click', () => {
        // The path is relative from /orders/success/ to /home/
        window.location.href = '../../home/index.html';
    });
});