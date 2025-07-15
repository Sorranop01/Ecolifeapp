document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotPasswordForm');
    const formContainer = document.getElementById('formContainer');
    const confirmationContainer = document.getElementById('confirmationContainer');
    const recoveryInput = document.getElementById('recoveryInput');
    const recoveryInputError = document.getElementById('recoveryInputError');
    const sentToDestination = document.getElementById('sentToDestination');
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = document.getElementById('loadingSpinner');

    function showError(message) {
        recoveryInputError.textContent = message;
        recoveryInput.classList.add('error');
    }

    function clearError() {
        recoveryInputError.textContent = '';
        recoveryInput.classList.remove('error');
    }

    function setLoading(isLoading) {
        if (isLoading) {
            submitButton.classList.add('loading');
            spinner.classList.remove('hidden');
        } else {
            submitButton.classList.remove('loading');
            spinner.classList.add('hidden');
        }
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        clearError();

        const recoveryValue = recoveryInput.value.trim();

        if (recoveryValue === '') {
            showError('กรุณากรอกเบอร์โทรศัพท์ หรือ อีเมล');
            return;
        }

        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);

            // Show confirmation screen
            sentToDestination.textContent = recoveryValue;
            formContainer.classList.add('hidden');
            confirmationContainer.classList.remove('hidden');
        }, 1500); // 1.5 second delay to simulate network
    });

    recoveryInput.addEventListener('input', clearError);
});