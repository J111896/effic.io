// Enhanced User Readiness Assessment JavaScript

class UserReadinessManager {
    constructor() {
        this.currentGroup = 1;
        this.totalGroups = 2;
        this.answers = {};
        this.groupQuestions = {
            1: ['performance_expectancy', 'effort_expectancy', 'social_influence'],
            2: ['facilitating_conditions', 'trust_in_tech', 'perceived_threat']
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateProgress();
        this.showGroup(1);
        this.updateGroupStates();
    }
    
    setupEventListeners() {
        // Answer button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('answer-button')) {
                this.handleAnswerClick(e.target);
            }
        });
        
        // Continue button
        const continueBtn = document.getElementById('continueToGroup2');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.continueToNextGroup());
        }
        
        // Form submission
        const form = document.getElementById('userReadinessForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
    }
    
    handleAnswerClick(button) {
        const questionName = button.getAttribute('data-question');
        const value = button.getAttribute('data-value');
        
        // Remove selection from other buttons in the same question
        const questionButtons = document.querySelectorAll(`[data-question="${questionName}"]`);
        questionButtons.forEach(btn => {
            btn.classList.remove('selected');
            const radio = btn.querySelector('input[type="radio"]');
            if (radio) radio.checked = false;
        });
        
        // Select current button
        button.classList.add('selected');
        const radio = button.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        
        // Store answer
        this.answers[questionName] = value;
        
        // Update UI states
        this.updateProgress();
        this.updateGroupStates();
        this.updateNavigationButtons();
        
        // Add visual feedback
        this.addAnswerFeedback(button);
    }
    
    addAnswerFeedback(button) {
        // Brief animation to confirm selection
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    updateProgress() {
        const totalQuestions = Object.keys(this.groupQuestions[1]).length + Object.keys(this.groupQuestions[2]).length;
        const answeredQuestions = Object.keys(this.answers).length;
        const progressPercentage = (answeredQuestions / totalQuestions) * 100;
        
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${answeredQuestions} von ${totalQuestions} Fragen beantwortet`;
        }
    }
    
    updateGroupStates() {
        const group1 = document.getElementById('group1');
        const group2 = document.getElementById('group2');
        
        // Check if group 1 is completed
        const group1Complete = this.isGroupComplete(1);
        const group2Complete = this.isGroupComplete(2);
        
        if (group1) {
            group1.classList.toggle('completed', group1Complete);
            group1.classList.toggle('active', this.currentGroup === 1);
        }
        
        if (group2) {
            group2.classList.toggle('completed', group2Complete);
            group2.classList.toggle('active', this.currentGroup === 2);
            group2.classList.toggle('disabled', !group1Complete && this.currentGroup === 1);
        }
    }
    
    isGroupComplete(groupNumber) {
        const questions = this.groupQuestions[groupNumber];
        return questions.every(question => this.answers.hasOwnProperty(question));
    }
    
    updateNavigationButtons() {
        const continueBtn = document.getElementById('continueToGroup2');
        const submitBtn = document.getElementById('submitAssessment');
        
        if (continueBtn) {
            const group1Complete = this.isGroupComplete(1);
            continueBtn.classList.toggle('enabled', group1Complete);
        }
        
        if (submitBtn) {
            const allComplete = this.isGroupComplete(1) && this.isGroupComplete(2);
            submitBtn.classList.toggle('enabled', allComplete);
        }
    }
    
    continueToNextGroup() {
        if (this.isGroupComplete(1)) {
            this.currentGroup = 2;
            this.showGroup(2);
            this.updateGroupStates();
            
            // Smooth scroll to group 2
            const group2 = document.getElementById('group2');
            if (group2) {
                group2.scrollIntoView({ behavior: 'smooth', block: 'start' });
                group2.classList.add('slide-in');
            }
        }
    }
    
    showGroup(groupNumber) {
        const group1 = document.getElementById('group1');
        const group2 = document.getElementById('group2');
        const continueSection = document.querySelector('.group-navigation');
        
        if (groupNumber === 1) {
            if (group1) group1.style.display = 'block';
            if (group2) group2.style.display = 'none';
            if (continueSection) continueSection.style.display = 'flex';
        } else if (groupNumber === 2) {
            if (group1) group1.style.display = 'block';
            if (group2) group2.style.display = 'block';
            if (continueSection) continueSection.style.display = 'none';
        }
    }
    
    handleFormSubmit(e) {
        const allComplete = this.isGroupComplete(1) && this.isGroupComplete(2);
        
        if (!allComplete) {
            e.preventDefault();
            this.showIncompleteMessage();
            return false;
        }
        
        // Add loading state to submit button
        const submitBtn = document.getElementById('submitAssessment');
        if (submitBtn) {
            submitBtn.innerHTML = '<span>⏳</span> Wird verarbeitet...';
            submitBtn.disabled = true;
        }
        
        return true;
    }
    
    showIncompleteMessage() {
        // Create and show a temporary message
        const message = document.createElement('div');
        message.className = 'incomplete-message';
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
                z-index: 1000;
                animation: slideInRight 0.3s ease;
            ">
                ⚠️ Bitte beantworten Sie alle Fragen, bevor Sie fortfahren.
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
        
        // Highlight incomplete sections
        this.highlightIncompleteQuestions();
    }
    
    highlightIncompleteQuestions() {
        [1, 2].forEach(groupNum => {
            if (!this.isGroupComplete(groupNum)) {
                const questions = this.groupQuestions[groupNum];
                questions.forEach(questionName => {
                    if (!this.answers.hasOwnProperty(questionName)) {
                        const questionItem = document.querySelector(`[data-question="${questionName}"]`)?.closest('.question-item');
                        if (questionItem) {
                            questionItem.style.border = '2px solid #ef4444';
                            questionItem.style.background = '#fef2f2';
                            
                            // Remove highlight after 2 seconds
                            setTimeout(() => {
                                questionItem.style.border = '';
                                questionItem.style.background = '';
                            }, 2000);
                        }
                    }
                });
            }
        });
    }
    
    handleKeyNavigation(e) {
        // Allow keyboard navigation between answer buttons
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const focused = document.activeElement;
            if (focused.classList.contains('answer-button')) {
                e.preventDefault();
                const questionButtons = document.querySelectorAll(`[data-question="${focused.getAttribute('data-question')}"]`);
                const currentIndex = Array.from(questionButtons).indexOf(focused);
                
                let nextIndex;
                if (e.key === 'ArrowRight') {
                    nextIndex = (currentIndex + 1) % questionButtons.length;
                } else {
                    nextIndex = (currentIndex - 1 + questionButtons.length) % questionButtons.length;
                }
                
                questionButtons[nextIndex].focus();
            }
        }
        
        // Enter or Space to select answer
        if (e.key === 'Enter' || e.key === ' ') {
            const focused = document.activeElement;
            if (focused.classList.contains('answer-button')) {
                e.preventDefault();
                focused.click();
            }
        }
    }
    
    // Public method to get current state
    getState() {
        return {
            currentGroup: this.currentGroup,
            answers: this.answers,
            group1Complete: this.isGroupComplete(1),
            group2Complete: this.isGroupComplete(2),
            totalProgress: (Object.keys(this.answers).length / 6) * 100
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the user readiness page
    if (document.getElementById('userReadinessForm')) {
        window.userReadinessManager = new UserReadinessManager();
        
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserReadinessManager;
}