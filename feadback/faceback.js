// ==========================================
// Feedback Page Script
// - ควบคุมการทำงานของหน้าให้คะแนน (Feedback)
// ==========================================

document.addEventListener('DOMContentLoaded', function() {

    const feedbackState = {
        overallRating: 0,
        mood: null,
        categoryRatings: {
            food: 0,
            delivery: 0,
            admin: 0,
            app: 0,
        },
        tags: {
            food: [],
            delivery: [],
            admin: [],
            app: [],
        },
        comment: '',
        photos: []
    };

    // --- DOM Elements ---
    const steps = {
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        step3: document.getElementById('step3'),
        step4: document.getElementById('step4'),
    };
    const progressBar = document.getElementById('progressBar');
    
    // --- Event Listeners ---

    // Step 1: Overall Star Rating
    document.querySelectorAll('.star-rating .star').forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            feedbackState.overallRating = rating;
            
            document.querySelectorAll('.star-rating .star').forEach((s, index) => {
                s.classList.toggle('active', index < rating);
            });
        });
    });

    // Step 1: Emoji Selection
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            feedbackState.mood = this.getAttribute('data-mood');
        });
    });
    
    // Step 2: Category Mini Stars
    document.querySelectorAll('.category-item').forEach(category => {
        const categoryKey = category.querySelector('.category-title').textContent.includes('อาหาร') ? 'food' :
                            category.querySelector('.category-title').textContent.includes('จัดส่ง') ? 'delivery' :
                            category.querySelector('.category-title').textContent.includes('แอดมิน') ? 'admin' : 'app';
        
        category.querySelectorAll('.mini-star').forEach((star, index) => {
            star.addEventListener('click', function() {
                const rating = index + 1;
                feedbackState.categoryRatings[categoryKey] = rating;
                const stars = category.querySelectorAll('.mini-star');
                stars.forEach((s, i) => {
                    s.classList.toggle('active', i < rating);
                });
            });
        });

        // Step 2: Tag Selection
        category.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', function() {
                this.classList.toggle('selected');
                const tagText = this.textContent;
                const tagSet = new Set(feedbackState.tags[categoryKey]);
                
                if (tagSet.has(tagText)) {
                    tagSet.delete(tagText);
                } else {
                    tagSet.add(tagText);
                }
                feedbackState.tags[categoryKey] = Array.from(tagSet);
            });
        });
    });
    
    // --- Navigation Functions (attached to window for inline onclick) ---
    
    function showStep(stepNumber) {
        Object.values(steps).forEach(step => step.style.display = 'none');
        const currentStep = steps[`step${stepNumber}`];
        if (currentStep) {
            currentStep.style.display = 'block';
            currentStep.classList.add('fade-in');
            progressBar.style.width = `${stepNumber * 25}%`;
        }
    }
    
    window.goToStep2 = function() {
        showStep(2);
    }
    
    window.goToStep3 = function() {
        showStep(3);
    }
    
    function showThankYou() {
        // Here you would typically send the data to your server
        console.log("Submitting feedback:", feedbackState);
        // fetch('/api/feedback', { method: 'POST', body: JSON.stringify(feedbackState) });
        
        showStep(4);
        document.querySelector('.feedback-header h1').textContent = "ส่งสำเร็จ!";
    }
    
    window.submitQuick = function() {
        showThankYou();
    }
    
    window.submitRatings = function() {
        showThankYou();
    }
    
    window.submitFeedback = function() {
        feedbackState.comment = document.querySelector('.textarea').value;
        showThankYou();
    }

    // Back button functionality
    document.querySelector('.back-button').addEventListener('click', () => {
        // A simple history back is often sufficient
        history.back();
    });

});