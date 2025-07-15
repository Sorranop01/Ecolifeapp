/**
 * Login & Register Page Logic
 * - Handles tab switching
 * - Form submission
 * - Toast notifications
 * - Password visibility toggle
 * - Password strength meter
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selection ---
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');
    const registerForm = document.getElementById('registerForm');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const passwordToggles = document.querySelectorAll('.password-toggle');
    const loginInput = document.getElementById('loginInput');
    const loginInputError = document.getElementById('loginInputError');
    const loginPassword = document.getElementById('loginPassword');
    const loginPasswordError = document.getElementById('loginPasswordError');
    const fullNameInput = document.getElementById('fullName');
    const fullNameError = document.getElementById('fullNameError');
    const registerPhoneInput = document.getElementById('registerPhone');
    const registerPhoneError = document.getElementById('registerPhoneError');
    const registerEmailInput = document.getElementById('registerEmail');
    const registerEmailError = document.getElementById('registerEmailError');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerPasswordError = document.getElementById('registerPasswordError');
    const strengthIndicator = document.querySelector('#passwordStrength .strength-indicator');
    const strengthText = document.getElementById('strengthText');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const termsAcceptCheckbox = document.getElementById('termsAccept');
    const termsAcceptError = document.getElementById('termsAcceptError');
    const backBtn = document.getElementById('backBtn');

    // --- Icon SVGs for Password Toggle ---
    const eyeIconSVG = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>`;
    const eyeSlashIconSVG = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4 .68l2.21 2.21C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
        </svg>`;

    /**
     * Shows a toast notification.
     * @param {string} message The message to display.
     * @param {'success'|'error'|'warning'|'info'} type The type of toast.
     * @param {number} duration The duration in milliseconds.
     */
    function showToast(message, type = 'success', duration = 3000) {
        toastMessage.textContent = message;

        // Reset classes and add the new type
        toast.className = 'toast';
        toast.classList.add(type);

        // Show the toast
        toast.classList.add('show');
        toast.classList.remove('hidden');

        // Hide the toast after the duration
        setTimeout(() => {
            toast.classList.remove('show');
            // Add 'hidden' back after the transition ends
            setTimeout(() => toast.classList.add('hidden'), 500);
        }, duration);
    }

    /**
     * Switches between Login and Register tabs.
     * @param {'login'|'register'} target The target tab to activate.
     */
    function switchTab(target) {
        const isLogin = target === 'login';

        // Update tab buttons
        loginTab.classList.toggle('active', isLogin);
        loginTab.setAttribute('aria-selected', isLogin);
        registerTab.classList.toggle('active', !isLogin);
        registerTab.setAttribute('aria-selected', !isLogin);

        // Update form panels
        loginPanel.classList.toggle('active', isLogin);
        registerPanel.classList.toggle('active', !isLogin);
    }

    /**
     * Sets up the event listeners for all password toggle buttons.
     */
    function setupPasswordToggles() {
        passwordToggles.forEach(button => {
            button.addEventListener('click', () => {
                const targetInputId = button.dataset.target;
                const passwordInput = document.getElementById(targetInputId);

                if (passwordInput) {
                    const isPasswordVisible = passwordInput.type === 'text';
                    if (isPasswordVisible) {
                        // Hide the password
                        passwordInput.type = 'password';
                        button.innerHTML = eyeIconSVG;
                        button.setAttribute('aria-label', 'แสดงรหัสผ่าน');
                    } else {
                        // Show the password
                        passwordInput.type = 'text';
                        button.innerHTML = eyeSlashIconSVG;
                        button.setAttribute('aria-label', 'ซ่อนรหัสผ่าน');
                    }
                }
            });
        });
    }

    // --- Validation Logic ---

    /**
     * Shows an error message for a form field.
     * @param {HTMLElement} inputEl The input element.
     * @param {HTMLElement} errorEl The error message element.
     * @param {string} message The error message to display.
     */
    function showError(inputEl, errorEl, message) {
        // For phone input, target the parent group for the border
        const targetEl = inputEl.classList.contains('phone-input') ? inputEl.parentElement : inputEl;
        targetEl.classList.add('error');
        targetEl.classList.remove('success');
        if (errorEl) {
            errorEl.textContent = message;
        }
    }

    /**
     * Clears an error message for a form field.
     * @param {HTMLElement} inputEl The input element.
     * @param {HTMLElement} errorEl The error message element.
     */
    function clearError(inputEl, errorEl) {
        const targetEl = inputEl.classList.contains('phone-input') ? inputEl.parentElement : inputEl;
        targetEl.classList.remove('error');
        if (errorEl) {
            errorEl.textContent = '';
        }
    }

    function validateLoginInput() {
        if (loginInput.value.trim() === '') {
            showError(loginInput, loginInputError, 'กรุณากรอกเบอร์โทรศัพท์ หรือ อีเมล');
            return false;
        }
        clearError(loginInput, loginInputError);
        return true;
    }

    function validateLoginPassword() {
        if (loginPassword.value.trim() === '') {
            showError(loginPassword, loginPasswordError, 'กรุณากรอกรหัสผ่าน');
            return false;
        }
        clearError(loginPassword, loginPasswordError);
        return true;
    }

    function validateLoginForm() {
        return validateLoginInput() && validateLoginPassword();
    }

    function validateFullName() {
        if (fullNameInput.value.trim() === '') {
            showError(fullNameInput, fullNameError, 'กรุณากรอกชื่อ-นามสกุล');
            return false;
        }
        clearError(fullNameInput, fullNameError);
        return true;
    }

    function validatePhone() {
        const phone = registerPhoneInput.value.trim();
        if (phone === '') {
            showError(registerPhoneInput, registerPhoneError, 'กรุณากรอกเบอร์โทรศัพท์');
            return false;
        }
        if (!/^0[0-9]{9}$/.test(phone.replace(/-/g, ''))) {
            showError(registerPhoneInput, registerPhoneError, 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก)');
            return false;
        }
        clearError(registerPhoneInput, registerPhoneError);
        return true;
    }

    function validateEmail() {
        const email = registerEmailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email === '') {
            showError(registerEmailInput, registerEmailError, 'กรุณากรอกอีเมล');
            return false;
        }
        if (!emailRegex.test(email)) {
            showError(registerEmailInput, registerEmailError, 'รูปแบบอีเมลไม่ถูกต้อง');
            return false;
        }
        clearError(registerEmailInput, registerEmailError);
        return true;
    }

    function validatePassword() {
        if (registerPasswordInput.value.length < 8) {
            showError(registerPasswordInput, registerPasswordError, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
            return false;
        }
        clearError(registerPasswordInput, registerPasswordError);
        return true;
    }

    function validateTerms() {
        if (!termsAcceptCheckbox.checked) {
            termsAcceptError.textContent = 'กรุณายอมรับข้อกำหนดและเงื่อนไข';
            return false;
        }
        termsAcceptError.textContent = '';
        return true;
    }

    function validateRegisterForm() {
        const isFullNameValid = validateFullName();
        const isPhoneValid = validatePhone();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();
        const areTermsAccepted = validateTerms();
        return isFullNameValid && isPhoneValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && areTermsAccepted;
    }

    /**
     * Validates that the confirm password field matches the password field.
     */
    function validateConfirmPassword() {
        // This function should only run if the elements exist
        if (!registerPasswordInput || !confirmPasswordInput || !confirmPasswordError) return true;

        const password = registerPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Clear previous success state before re-validating
        confirmPasswordInput.classList.remove('success');

        // Only show error if the confirm password field has text and doesn't match
        if (confirmPassword.length > 0 && password !== confirmPassword) {
            confirmPasswordError.textContent = 'รหัสผ่านไม่ตรงกัน';
            confirmPasswordInput.classList.add('error');
            return false;
        } else {
            confirmPasswordError.textContent = '';
            confirmPasswordInput.classList.remove('error');
            // Add success state if they match and are not empty
            if (confirmPassword.length > 0 && password === confirmPassword) {
                confirmPasswordInput.classList.add('success');
            }
            return true;
        }
    }

    /**
     * Evaluates and updates the password strength meter UI.
     * @param {string} password The password to evaluate.
     */
    function updatePasswordStrength(password) {
        // Ensure the strength meter elements exist on the page
        if (!strengthIndicator || !strengthText) return;

        const strengthLevels = [
            { text: 'ความแข็งแรงของรหัสผ่าน', className: '' },       // Score 0
            { text: 'อ่อนมาก', className: 'weak' },             // Score 1
            { text: 'พอใช้', className: 'fair' },              // Score 2
            { text: 'ดี', className: 'good' },               // Score 3
            { text: 'แข็งแกร่งมาก', className: 'strong' }        // Score 4
        ];

        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        // Reset to initial state if the password is empty
        if (password.length === 0) {
            score = 0;
        }

        const level = strengthLevels[score];
        strengthText.textContent = level.text;
        strengthText.className = `strength-text ${level.className}`;

        const bars = strengthIndicator.querySelectorAll('.strength-bar');
        bars.forEach((bar, index) => {
            // Apply the class if the bar's index is less than the current score
            bar.className = index < score ? `strength-bar ${level.className}` : 'strength-bar';
        });
    }

    // --- Event Listeners ---

    // Back button functionality
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Check if there is a page to go back to in the history
            if (window.history.length > 1) {
                window.history.back();
            } else {
                // If not, navigate to the homepage as a fallback
                window.location.href = '../../home/index.html';
            }
        });
    }

    // Tab switching
    loginTab.addEventListener('click', () => switchTab('login'));
    registerTab.addEventListener('click', () => switchTab('register'));

    // Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const isFormValid = validateLoginForm();
            if (!isFormValid) {
                showToast('กรุณากรอกข้อมูลให้ถูกต้อง', 'error');
                return;
            }

            const loginButton = loginForm.querySelector('button[type="submit"]');
            const spinner = document.getElementById('loginSpinner');

            // Show loading state
            loginButton.classList.add('loading');
            spinner.classList.remove('hidden');

            // Simulate API call for login
            setTimeout(() => {
                // Hide loading state
                loginButton.classList.remove('loading');
                spinner.classList.add('hidden');

                // --- Mock Login Logic ---
                // In a real app, you'd get a response from your server.
                // Here, we'll simulate a failed login if the password is not 'password123'.
                const MOCK_CORRECT_PASSWORD = 'password123';
                if (loginPassword.value === MOCK_CORRECT_PASSWORD) {
                    // --- Login Success ---
                    showToast('เข้าสู่ระบบสำเร็จ!', 'success');

                    // Redirect to homepage after a short delay
                    setTimeout(() => {
                        window.location.href = '../../home/index.html';
                    }, 1000);
                } else {
                    // --- Login Failed ---
                    const errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
                    showError(loginInput, loginInputError, errorMessage);
                    showError(loginPassword, loginPasswordError, ''); // Add red border without text
                    showToast(errorMessage, 'error');
                }
            }, 1500); // Simulate a 1.5-second API call
        });
    }

    // Register Form Submission
    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent the form from actually submitting

            // Run all validations and check if the form is valid
            const isFormValid = validateRegisterForm();
            if (!isFormValid) {
                showToast('กรุณากรอกข้อมูลให้ถูกต้อง', 'error');
                return; // Stop submission if validation fails
            }
            
            const registerButton = registerForm.querySelector('button[type="submit"]');
            const spinner = document.getElementById('registerSpinner');

            // Show loading state on the button
            registerButton.classList.add('loading');
            spinner.classList.remove('hidden');

            // Simulate a network request (e.g., calling an API)
            setTimeout(() => {
                // Hide loading state
                registerButton.classList.remove('loading');
                spinner.classList.add('hidden');

                // 1. แสดงข้อความ "สมัครสมาชิกสำเร็จ" ผ่าน Toast Notification
                showToast('สมัครสมาชิกสำเร็จ!', 'success');

                // 2. เคลียร์ข้อมูลทั้งหมดในฟอร์ม
                registerForm.reset();

                // 3. รีเซ็ตสถานะ UI อื่นๆ ที่เกี่ยวข้องกับฟอร์ม
                updatePasswordStrength(''); // รีเซ็ต password strength meter

                // 4. (แนะนำ) เลื่อนหน้าจอขึ้นไปด้านบนของฟอร์มเพื่อให้ผู้ใช้เห็นว่าฟอร์มว่างแล้ว
                registerForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 2000); // Simulate a 2-second API call
        });
    }

    // Password Strength Meter Listener
    if (registerPasswordInput) {
        registerPasswordInput.addEventListener('input', (event) => {
            updatePasswordStrength(event.target.value);
            // Re-validate the confirmation field if it has a value
            validateConfirmPassword();
        });
    }

    // Confirm Password Listener
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    }

    // Add real-time validation listeners (on blur)
    if (loginInput) {
        loginInput.addEventListener('blur', validateLoginInput);
        loginInput.addEventListener('input', () => clearError(loginInput, loginInputError));
    }
    if (loginPassword) {
        loginPassword.addEventListener('blur', validateLoginPassword);
        loginPassword.addEventListener('input', () => clearError(loginPassword, loginPasswordError));
    }

    if (fullNameInput) fullNameInput.addEventListener('blur', validateFullName);
    if (registerPhoneInput) registerPhoneInput.addEventListener('blur', validatePhone);
    if (registerEmailInput) registerEmailInput.addEventListener('blur', validateEmail);
    if (registerPasswordInput) registerPasswordInput.addEventListener('blur', validatePassword);
    if (termsAcceptCheckbox) termsAcceptCheckbox.addEventListener('change', validateTerms);

    // Initialize password toggles
    setupPasswordToggles();
});