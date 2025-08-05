import React, { useState, useEffect, useCallback } from 'react';

/**
 * Step Navigation Hook
 * Verwaltet den Zustand und die Navigation zwischen Schritten
 */
export const useStepNavigation = (steps, initialStep = 0) => {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [formData, setFormData] = useState({});
    const [stepHistory, setStepHistory] = useState([initialStep]);

    // Load saved data from sessionStorage on mount
    useEffect(() => {
        const savedStep = sessionStorage.getItem('currentStep');
        const savedData = sessionStorage.getItem('stepFormData');
        const savedHistory = sessionStorage.getItem('stepHistory');

        if (savedStep) {
            setCurrentStep(parseInt(savedStep));
        }
        if (savedData) {
            try {
                setFormData(JSON.parse(savedData));
            } catch (error) {
                console.error('Error parsing saved form data:', error);
            }
        }
        if (savedHistory) {
            try {
                setStepHistory(JSON.parse(savedHistory));
            } catch (error) {
                console.error('Error parsing saved history:', error);
            }
        }
    }, []);

    // Save to sessionStorage whenever state changes
    useEffect(() => {
        sessionStorage.setItem('currentStep', currentStep.toString());
        sessionStorage.setItem('stepFormData', JSON.stringify(formData));
        sessionStorage.setItem('stepHistory', JSON.stringify(stepHistory));
    }, [currentStep, formData, stepHistory]);

    const updateFormData = useCallback((stepId, data) => {
        setFormData(prev => ({
            ...prev,
            [stepId]: { ...prev[stepId], ...data }
        }));
    }, []);

    const goToStep = useCallback((stepIndex) => {
        if (stepIndex >= 0 && stepIndex < steps.length) {
            setCurrentStep(stepIndex);
            setStepHistory(prev => [...prev, stepIndex]);
        }
    }, [steps.length]);

    const goBack = useCallback(() => {
        if (stepHistory.length > 1) {
            const newHistory = [...stepHistory];
            newHistory.pop(); // Remove current step
            const previousStep = newHistory[newHistory.length - 1];
            setCurrentStep(previousStep);
            setStepHistory(newHistory);
        }
    }, [stepHistory]);

    const goForward = useCallback(() => {
        if (currentStep < steps.length - 1) {
            goToStep(currentStep + 1);
        }
    }, [currentStep, steps.length, goToStep]);

    const canGoBack = stepHistory.length > 1;
    const canGoForward = currentStep < steps.length - 1;
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    const clearData = useCallback(() => {
        setFormData({});
        setCurrentStep(0);
        setStepHistory([0]);
        sessionStorage.removeItem('currentStep');
        sessionStorage.removeItem('stepFormData');
        sessionStorage.removeItem('stepHistory');
    }, []);

    return {
        currentStep,
        formData,
        stepHistory,
        updateFormData,
        goToStep,
        goBack,
        goForward,
        canGoBack,
        canGoForward,
        isFirstStep,
        isLastStep,
        clearData
    };
};

/**
 * Progress Indicator Component
 */
export const ProgressIndicator = ({ steps, currentStep, className = '' }) => {
    const progressPercentage = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className={`progress-indicator ${className}`}>
            <div className="progress-bar">
                <div 
                    className="progress-fill" 
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
            <div className="progress-text">
                Schritt {currentStep + 1} von {steps.length}: {steps[currentStep]?.name}
            </div>
            <div className="step-dots">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className={`step-dot ${
                            index === currentStep ? 'active' : 
                            index < currentStep ? 'completed' : ''
                        }`}
                        title={step.name}
                    />
                ))}
            </div>
        </div>
    );
};

/**
 * Navigation Buttons Component
 */
export const NavigationButtons = ({ 
    onBack, 
    onForward, 
    canGoBack, 
    canGoForward, 
    backLabel = 'Zurück', 
    forwardLabel = 'Weiter',
    isLoading = false,
    className = ''
}) => {
    return (
        <div className={`navigation-buttons ${className}`}>
            <button
                type="button"
                onClick={onBack}
                disabled={!canGoBack || isLoading}
                className={`back-button enhanced-back-button ${
                    isLoading ? 'navigation-loading' : ''
                }`}
            >
                ← {backLabel}
            </button>
            
            <button
                type="button"
                onClick={onForward}
                disabled={!canGoForward || isLoading}
                className={`forward-button ${
                    isLoading ? 'navigation-loading' : ''
                }`}
            >
                {forwardLabel} →
            </button>
        </div>
    );
};

/**
 * Auto Save Component
 */
export const AutoSave = ({ formData, onSave, interval = 30000 }) => {
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (formData && Object.keys(formData).length > 0) {
                setSaveStatus('saving');
                try {
                    onSave(formData);
                    setSaveStatus('saved');
                    setLastSaved(new Date());
                } catch (error) {
                    setSaveStatus('error');
                    console.error('Auto-save failed:', error);
                }
            }
        }, interval);

        return () => clearInterval(autoSaveInterval);
    }, [formData, onSave, interval]);

    if (saveStatus === 'saved' && !lastSaved) return null;

    return (
        <div className={`auto-save-indicator ${saveStatus === 'saved' ? 'show' : saveStatus}`}>
            {saveStatus === 'saving' && 'Speichere...'}
            {saveStatus === 'saved' && `Gespeichert um ${lastSaved?.toLocaleTimeString()}`}
            {saveStatus === 'error' && 'Speichern fehlgeschlagen'}
        </div>
    );
};

/**
 * Main Step Navigation Component
 */
export const StepNavigation = ({ 
    steps, 
    children, 
    onStepChange,
    onFormDataChange,
    initialStep = 0,
    showProgress = true,
    showNavigation = true,
    autoSave = true,
    className = ''
}) => {
    const {
        currentStep,
        formData,
        updateFormData,
        goBack,
        goForward,
        canGoBack,
        canGoForward,
        isFirstStep,
        isLastStep
    } = useStepNavigation(steps, initialStep);

    const [isLoading, setIsLoading] = useState(false);

    // Notify parent of step changes
    useEffect(() => {
        if (onStepChange) {
            onStepChange(currentStep, steps[currentStep]);
        }
    }, [currentStep, onStepChange, steps]);

    // Notify parent of form data changes
    useEffect(() => {
        if (onFormDataChange) {
            onFormDataChange(formData);
        }
    }, [formData, onFormDataChange]);

    const handleBack = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async operation
            goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const handleForward = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async operation
            goForward();
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormDataUpdate = (data) => {
        updateFormData(steps[currentStep].id, data);
    };

    const handleAutoSave = (data) => {
        // Auto-save logic here
        console.log('Auto-saving data:', data);
    };

    return (
        <div className={`step-navigation-container ${className}`}>
            {showProgress && (
                <ProgressIndicator 
                    steps={steps} 
                    currentStep={currentStep} 
                />
            )}
            
            <div className="step-content step-transition">
                {React.cloneElement(children, {
                    stepData: formData[steps[currentStep]?.id] || {},
                    onDataChange: handleFormDataUpdate,
                    currentStep,
                    isFirstStep,
                    isLastStep
                })}
            </div>
            
            {showNavigation && (
                <NavigationButtons
                    onBack={handleBack}
                    onForward={handleForward}
                    canGoBack={canGoBack}
                    canGoForward={canGoForward}
                    backLabel={canGoBack ? `Zurück zu ${steps[currentStep - 1]?.name}` : 'Zurück zum Start'}
                    forwardLabel={isLastStep ? 'Abschließen' : `Weiter zu ${steps[currentStep + 1]?.name}`}
                    isLoading={isLoading}
                />
            )}
            
            {autoSave && (
                <AutoSave 
                    formData={formData}
                    onSave={handleAutoSave}
                />
            )}
        </div>
    );
};

/**
 * Example Step Component
 */
export const ExampleStepComponent = ({ stepData, onDataChange, currentStep }) => {
    const handleInputChange = (field, value) => {
        onDataChange({ [field]: value });
    };

    return (
        <div className="step-form">
            <h2>Schritt {currentStep + 1}</h2>
            <div className="form-group">
                <label htmlFor="example-input">Beispiel Eingabe:</label>
                <input
                    id="example-input"
                    type="text"
                    value={stepData.exampleField || ''}
                    onChange={(e) => handleInputChange('exampleField', e.target.value)}
                    placeholder="Geben Sie hier etwas ein..."
                />
            </div>
        </div>
    );
};

// Usage Example:
/*
const steps = [
    { id: 'technik', name: 'Technik-Bewertung' },
    { id: 'kpi', name: 'KPI-Bewertung' },
    { id: 'user', name: 'Nutzerbereitschaft' }
];

function App() {
    const handleStepChange = (stepIndex, step) => {
        console.log('Current step:', stepIndex, step);
    };

    const handleFormDataChange = (formData) => {
        console.log('Form data updated:', formData);
    };

    return (
        <StepNavigation
            steps={steps}
            onStepChange={handleStepChange}
            onFormDataChange={handleFormDataChange}
            showProgress={true}
            showNavigation={true}
            autoSave={true}
        >
            <ExampleStepComponent />
        </StepNavigation>
    );
}
*/

export default StepNavigation;