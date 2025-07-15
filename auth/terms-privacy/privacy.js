document.addEventListener('DOMContentLoaded', function() {
    const acceptButton = document.getElementById('acceptBtn');

    if (acceptButton) {
        acceptButton.addEventListener('click', function() {
            console.log('Accept button clicked on Privacy page. Redirecting to homepage.');
            
            // Redirect to the main page (e.g., index.html)
            window.location.href = 'index.html';
        });
    }
});