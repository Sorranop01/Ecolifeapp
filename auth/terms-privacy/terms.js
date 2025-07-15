document.addEventListener('DOMContentLoaded', function() {
    const acceptButton = document.getElementById('acceptBtn');

    if (acceptButton) {
        acceptButton.addEventListener('click', function() {
            // Log for debugging
            console.log('Accept button clicked. Redirecting to homepage.');
            
            // Redirect to the main page (e.g., index.html)
            // You can change "index.html" to your actual homepage file
            window.location.href = 'index.html';
        });
    }
});