/**
 * Step Navigation Manager
 * Verwaltet die Navigation zwischen den Bewertungsschritten mit persistentem Zustand
 */

class StepNavigationManager {
    constructor() {
        this.steps = [
            { id: 'technik', name: 'Technik-Bewertung', url: '/technik_bewertung', sessionKey: 'technik_evaluation' },
            { id: 'kpi', name: 'KPI-Bewertung', url: '/kpi_bewertung', sessionKey: 'kpi_evaluation' },
            { id: 'user', name: 'Nutzerbereitschaft', url: '/user_readiness', sessionKey: 'user_readiness_evaluation' }
        ];
        
        this.currentStep = this.getCurrentStepFromURL();
        this.init();
    }

    init() {
        this.createProgressIndicator();
        this.updateBackButton();
        this.saveCurrentStepToSession();
    }

    getCurrentStepFromURL() {
        const path = window.location.pathname;
        
        if (path.includes('technik')) return 0;
        if (path.includes('kpi')) return 1;
        if (path.includes('user_readiness')) return 2;
        
        return 0; // Default to first step
    }

    saveCurrentStepToSession() {
        sessionStorage.setItem('currentStep', this.currentStep);
    }

    createProgressIndicator() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-indicator';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${((this.currentStep + 1) / this.steps.length) * 100}%"></div>
            </div>
            <div class="progress-text">
                Schritt ${this.currentStep + 1} von ${this.steps.length}: ${this.steps[this.currentStep].name}
            </div>
        `;

        // Insert progress indicator at the top of the main content
        const header = document.querySelector('.technik-header');
        if (header) {
            header.insertAdjacentElement('afterend', progressContainer);
        }
    }

    updateBackButton() {
        const backButton = document.querySelector('.back-button');
        if (!backButton) return;

        // Remove existing event listeners
        const newBackButton = backButton.cloneNode(true);
        backButton.parentNode.replaceChild(newBackButton, backButton);

        if (this.currentStep > 0) {
            const previousStep = this.steps[this.currentStep - 1];
            newBackButton.textContent = `← Zurück zu ${previousStep.name}`;
            newBackButton.href = previousStep.url;
            newBackButton.classList.add('step-back-button');
            
            // Add click handler to preserve form data
            newBackButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveCurrentFormData();
                window.location.href = previousStep.url;
            });
        } else {
            newBackButton.textContent = '← Zurück zum Start';
            newBackButton.href = '/';
        }
    }

    saveCurrentFormData() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const formData = new FormData(form);
            const data = {};
            
            // Save regular form fields
            for (let [key, value] of formData.entries()) {
                if (data[key]) {
                    // Handle multiple values (checkboxes)
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            }

            // Save KPI slider data if present
            if (window.selectedKpisList) {
                data.selectedKpisList = window.selectedKpisList;
            }

            // Store in sessionStorage with step-specific key
            const stepKey = `formData_${this.steps[this.currentStep].id}`;
            sessionStorage.setItem(stepKey, JSON.stringify(data));
        });
    }

    restoreFormData() {
        const stepKey = `formData_${this.steps[this.currentStep].id}`;
        const savedData = sessionStorage.getItem(stepKey);
        
        if (!savedData) return;

        try {
            const data = JSON.parse(savedData);
            
            // Restore regular form fields
            Object.entries(data).forEach(([key, value]) => {
                if (key === 'selectedKpisList') {
                    // Handle KPI data separately
                    if (window.selectedKpisList !== undefined) {
                        window.selectedKpisList = value;
                        this.restoreKPISelections(value);
                    }
                    return;
                }

                const elements = document.querySelectorAll(`[name="${key}"]`);
                elements.forEach(element => {
                    if (element.type === 'radio') {
                        element.checked = element.value === value;
                    } else if (element.type === 'checkbox') {
                        const values = Array.isArray(value) ? value : [value];
                        element.checked = values.includes(element.value);
                    } else {
                        element.value = value;
                    }
                });
            });
        } catch (error) {
            console.error('Error restoring form data:', error);
        }
    }

    restoreKPISelections(selectedKpis) {
        // This method should be called after KPI page is fully loaded
        setTimeout(() => {
            selectedKpis.forEach(kpi => {
                const checkbox = document.querySelector(`input[value="${kpi.value}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change'));
                    
                    // Restore slider value
                    setTimeout(() => {
                        const slider = document.querySelector(`#kpi-slider-${kpi.value} input[type="range"]`);
                        if (slider && kpi.position) {
                            slider.value = kpi.position;
                            slider.dispatchEvent(new Event('input'));
                        }
                    }, 100);
                }
            });
        }, 200);
    }

    // Method to be called when navigating forward
    navigateForward(targetUrl) {
        this.saveCurrentFormData();
        window.location.href = targetUrl;
    }

    // Method to clear all saved data (e.g., when starting fresh)
    clearSavedData() {
        this.steps.forEach(step => {
            sessionStorage.removeItem(`formData_${step.id}`);
        });
        sessionStorage.removeItem('currentStep');
    }

    // Method to check if user can access a specific step
    canAccessStep(stepIndex) {
        // User can access current step and previous steps
        // For next steps, check if previous steps are completed
        for (let i = 0; i < stepIndex; i++) {
            const stepData = sessionStorage.getItem(`formData_${this.steps[i].id}`);
            if (!stepData) {
                return false;
            }
        }
        return true;
    }
}

// Back Button Component
class BackButtonComponent {
    constructor(stepManager) {
        this.stepManager = stepManager;
        this.init();
    }

    init() {
        this.enhanceBackButton();
    }

    enhanceBackButton() {
        const backButton = document.querySelector('.back-button');
        if (!backButton) return;

        // Add enhanced styling
        backButton.classList.add('enhanced-back-button');
        
        // Add hover effects and animations
        backButton.addEventListener('mouseenter', () => {
            backButton.style.transform = 'translateX(-5px)';
        });
        
        backButton.addEventListener('mouseleave', () => {
            backButton.style.transform = 'translateX(0)';
        });
    }
}

// Auto-save functionality
class AutoSaveManager {
    constructor(stepManager) {
        this.stepManager = stepManager;
        this.saveInterval = 30000; // Save every 30 seconds
        this.init();
    }

    init() {
        // Auto-save on form changes
        document.addEventListener('change', () => {
            this.stepManager.saveCurrentFormData();
        });

        // Auto-save on input for text fields
        document.addEventListener('input', (e) => {
            if (e.target.type === 'text' || e.target.type === 'textarea') {
                clearTimeout(this.inputTimeout);
                this.inputTimeout = setTimeout(() => {
                    this.stepManager.saveCurrentFormData();
                }, 1000);
            }
        });

        // Periodic auto-save
        setInterval(() => {
            this.stepManager.saveCurrentFormData();
        }, this.saveInterval);

        // Save before page unload
        window.addEventListener('beforeunload', () => {
            this.stepManager.saveCurrentFormData();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const stepManager = new StepNavigationManager();
    const backButton = new BackButtonComponent(stepManager);
    const autoSave = new AutoSaveManager(stepManager);
    
    // Restore form data after a short delay to ensure all elements are loaded
    setTimeout(() => {
        stepManager.restoreFormData();
    }, 100);
    
    // Make stepManager globally available for form submissions
    window.stepNavigationManager = stepManager;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StepNavigationManager, BackButtonComponent, AutoSaveManager };
}