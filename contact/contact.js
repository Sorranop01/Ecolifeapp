document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENTS ---
    const backBtn = document.getElementById('back-btn');
    const contactForm = document.getElementById('contact-form');
    const faqItems = document.querySelectorAll('.faq-item');

    // --- EVENT LISTENERS ---

    // Back button navigation
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (document.referrer && document.referrer.startsWith(window.location.origin)) {
                history.back();
            } else {
                window.location.href = '../home/index.html'; // Fallback to home
            }
        });
    }

    // FAQ Accordion
    if (faqItems) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            question.addEventListener('click', () => {
                const isExpanded = question.getAttribute('aria-expanded') === 'true';
                
                question.setAttribute('aria-expanded', !isExpanded);
                if (!isExpanded) {
                    // Expand
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    // Collapse
                    answer.style.maxHeight = '0';
                }
            });
        });
    }

    // Contact Form Handling
    if (contactForm) {
        const submitBtn = document.getElementById('submit-btn');
        const inputs = contactForm.querySelectorAll('input, select, textarea');

        const validationRules = {
            name: (value) => value.trim() !== '' ? '' : 'กรุณากรอกชื่อ-นามสกุล',
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'รูปแบบอีเมลไม่ถูกต้อง',
            subject: (value) => value !== '' ? '' : 'กรุณาเลือกหัวข้อเรื่อง',
            message: (value) => value.trim().length >= 10 ? '' : 'กรุณากรอกข้อความอย่างน้อย 10 ตัวอักษร',
        };

        const validateField = (field) => {
            const rule = validationRules[field.name];
            if (!rule) return true;

            const errorMessage = rule(field.value);
            const errorElement = field.parentElement.querySelector('.error-message');
            
            if (errorMessage) {
                errorElement.textContent = errorMessage;
                field.parentElement.classList.add('error');
                return false;
            } else {
                errorElement.textContent = '';
                field.parentElement.classList.remove('error');
                return true;
            }
        };

        const validateForm = () => {
            let isFormValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isFormValid = false;
                }
            });
            return isFormValid;
        };

        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                 // Clear error on input
                 const errorElement = input.parentElement.querySelector('.error-message');
                 if (errorElement.textContent) {
                    validateField(input);
                 }
            });
        });

        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();

            if (validateForm()) {
                // --- Simulate form submission ---
                submitBtn.disabled = true;
                submitBtn.textContent = 'กำลังส่ง...';

                const formData = new FormData(contactForm);
                const data = Object.fromEntries(formData.entries());
                console.log('Form data to be sent:', data);

                setTimeout(() => {
                    // Success
                    alert('ส่งข้อความของคุณเรียบร้อยแล้ว! ทีมงานจะติดต่อกลับโดยเร็วที่สุด');
                    contactForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'ส่งข้อความ';

                    // Clear all error states
                    inputs.forEach(input => {
                        const errorElement = input.parentElement.querySelector('.error-message');
                        errorElement.textContent = '';
                        input.parentElement.classList.remove('error');
                    });

                }, 1500);
            } else {
                console.log('Form validation failed.');
            }
        });
    }
});