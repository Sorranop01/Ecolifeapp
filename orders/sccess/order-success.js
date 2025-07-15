document.addEventListener('DOMContentLoaded', () => {
    const orderNumberEl = document.getElementById('orderNumber');
    const trackOrderBtn = document.getElementById('trackOrderBtn');

    // 1. Get the order ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (orderId) {
        // 2. Display the order number
        orderNumberEl.textContent = `#${orderId}`;

        // 3. Update the "Track Order" button link
        // The path is relative from /orders/sccess/ to /orders/tracking/
        trackOrderBtn.href = `../tracking/order-tracking.html?order=${orderId}`;
    } else {
        // Handle case where no order ID is provided
        orderNumberEl.textContent = '#N/A';
        trackOrderBtn.style.display = 'none'; // Hide button if no order ID
    }
});