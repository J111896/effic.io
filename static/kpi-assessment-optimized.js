/**
 * Optimierte KPI-Bewertungskomponente
 * Fokus auf Nutzerführung und kognitive Entlastung
 */

class OptimizedKPIAssessment {
    constructor() {
        this.selectedKPIs = [];
        this.maxKPIs = 3;
        this.kpiDefinitions = this.initializeKPIDefinitions();
        this.impactLevels = this.initializeImpactLevels();
        this.init();
    }

    /**
     * Initialisiert KPI-Definitionen mit kontextuellen Hinweisen
     */
    initializeKPIDefinitions() {
        return {
            'umsatz': {
                name: 'Umsatz',
                icon: '💰',
                tooltip: 'Umsatzsteigerung durch KI-Optimierung. Beispiel: 5-15% Steigerung durch bessere Kundenanalyse oder Preisoptimierung.',
                benchmarks: ['Keine Änderung', '2-5% Steigerung', '5-10% Steigerung', '10-20% Steigerung', '20%+ Steigerung']
            },
            'kosten': {
                name: 'Kosten',
                icon: '📉',
                tooltip: 'Kosteneinsparung durch Automatisierung und Effizienzsteigerung. Beispiel: 10-30% Reduktion der Betriebskosten.',
                benchmarks: ['Keine Einsparung', '5-10% Reduktion', '10-20% Reduktion', '20-35% Reduktion', '35%+ Reduktion']
            },
            'durchlaufzeit': {
                name: 'Durchlaufzeit',
                icon: '⚡',
                tooltip: 'Beschleunigung von Prozessen durch KI-Automatisierung. Beispiel: 20-50% schnellere Bearbeitung von Anfragen.',
                benchmarks: ['Keine Verbesserung', '10-20% schneller', '20-40% schneller', '40-60% schneller', '60%+ schneller']
            },
            'co2': {
                name: 'CO₂-Reduktion',
                icon: '🌱',
                tooltip: 'Umweltauswirkungen durch optimierte Ressourcennutzung. Beispiel: 15-40% CO₂-Reduktion durch intelligente Routenplanung.',
                benchmarks: ['Keine Reduktion', '5-15% weniger CO₂', '15-25% weniger CO₂', '25-40% weniger CO₂', '40%+ weniger CO₂']
            },
            'kundenbindung': {
                name: 'Kundenbindung',
                icon: '🤝',
                tooltip: 'Verbesserung der Kundenzufriedenheit und -loyalität. Beispiel: 10-25% höhere Kundenbindungsrate durch personalisierte Services.',
                benchmarks: ['Keine Verbesserung', '5-10% höhere Bindung', '10-20% höhere Bindung', '20-30% höhere Bindung', '30%+ höhere Bindung']
            },
            'fehlerrate': {
                name: 'Fehlerrate',
                icon: '🎯',
                tooltip: 'Qualitätsverbesserung durch KI-gestützte Fehlererkennung. Beispiel: 30-70% weniger Fehler in der Produktion.',
                benchmarks: ['Keine Reduktion', '10-25% weniger Fehler', '25-50% weniger Fehler', '50-75% weniger Fehler', '75%+ weniger Fehler']
            }
        };
    }

    /**
     * Initialisiert die Impact-Level mit klaren Bedeutungen
     */
    initializeImpactLevels() {
        return [
            {
                level: 1,
                label: 'Minimal',
                description: 'Kaum messbare Verbesserung',
                score: 0.0,
                color: '#ef4444'
            },
            {
                level: 2,
                label: 'Gering',
                description: 'Kleine, aber spürbare Verbesserung',
                score: 0.25,
                color: '#f59e0b'
            },
            {
                level: 3,
                label: 'Mittel',
                description: 'Deutlich messbare Verbesserung',
                score: 0.5,
                color: '#eab308'
            },
            {
                level: 4,
                label: 'Hoch',
                description: 'Starke, signifikante Verbesserung',
                score: 0.75,
                color: '#22c55e'
            },
            {
                level: 5,
                label: 'Extrem',
                description: 'Transformative Verbesserung',
                score: 1.0,
                color: '#16a34a'
            }
        ];
    }

    /**
     * Initialisiert die Komponente
     */
    init() {
        this.bindEvents();
        this.updateHiddenInput();
    }

    /**
     * Bindet Event-Listener
     */
    bindEvents() {
        const kpiCheckboxes = document.querySelectorAll('.kpi-select-box');
        kpiCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleKPISelection(e));
        });

        // Form submission handler
        const form = document.getElementById('kpiForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmission(e));
        }
    }

    /**
     * Behandelt KPI-Auswahl mit intelligenter Begrenzung
     */
    handleKPISelection(event) {
        const checkbox = event.target;
        const kpiValue = checkbox.value;
        const kpiDefinition = this.kpiDefinitions[kpiValue];

        if (checkbox.checked) {
            // Prüfe maximale Anzahl
            if (this.selectedKPIs.length >= this.maxKPIs) {
                // Entferne älteste Auswahl
                const oldestKPI = this.selectedKPIs.shift();
                const oldCheckbox = document.querySelector(`.kpi-select-box[value="${oldestKPI.value}"]`);
                if (oldCheckbox) {
                    oldCheckbox.checked = false;
                }
                this.removeKPIAssessment(oldestKPI.value);
            }

            // Füge neue KPI hinzu
            const newKPI = {
                value: kpiValue,
                name: kpiDefinition.name,
                score: 0.5, // Standard: mittlerer Impact
                level: 3
            };

            this.selectedKPIs.push(newKPI);
            this.createKPIAssessment(kpiValue, kpiDefinition);
        } else {
            // Entferne KPI
            this.selectedKPIs = this.selectedKPIs.filter(kpi => kpi.value !== kpiValue);
            this.removeKPIAssessment(kpiValue);
        }

        this.updateNoKPIMessage();
        this.updateHiddenInput();
    }

    /**
     * Erstellt eine optimierte KPI-Bewertungskomponente
     */
    createKPIAssessment(kpiValue, kpiDefinition) {
        const container = document.getElementById('kpi-sliders-container');
        const assessmentDiv = document.createElement('div');
        assessmentDiv.id = `kpi-assessment-${kpiValue}`;
        assessmentDiv.className = 'kpi-assessment-item';

        assessmentDiv.innerHTML = `
            <div class="kpi-assessment-header">
                <div class="kpi-name">
                    <span class="kpi-icon">${kpiDefinition.icon}</span>
                    ${kpiDefinition.name}
                </div>
                <div class="kpi-value-badge" id="kpi-badge-${kpiValue}">
                    Mittel
                </div>
                <div class="kpi-tooltip">
                    <div class="tooltip-trigger">?</div>
                    <div class="tooltip-content">
                        ${kpiDefinition.tooltip}
                    </div>
                </div>
            </div>
            <div class="impact-scale-container">
                <div class="impact-scale-title">
                    <span>🎯</span>
                    Erwarteter Impact
                </div>
                <div class="impact-scale">
                    <div class="impact-line"></div>
                    ${this.generateImpactLevels(kpiValue)}
                </div>
                <div class="benchmark-indicators">
                    ${this.generateBenchmarkIndicators(kpiDefinition.benchmarks)}
                </div>
            </div>
        `;

        container.appendChild(assessmentDiv);
        this.bindImpactLevelEvents(kpiValue);
        this.setDefaultImpactLevel(kpiValue, 3);
    }

    /**
     * Generiert Impact-Level HTML
     */
    generateImpactLevels(kpiValue) {
        return this.impactLevels.map(level => `
            <div class="impact-level" data-kpi="${kpiValue}" data-level="${level.level}" 
                 role="button" tabindex="0" aria-pressed="false"
                 title="${level.label}: ${level.description}">
                <div class="impact-point">${level.level}</div>
                <div class="impact-label">${level.label}</div>
            </div>
        `).join('');
    }

    /**
     * Generiert Benchmark-Indikatoren
     */
    generateBenchmarkIndicators(benchmarks) {
        return benchmarks.map(benchmark => `
            <div class="benchmark-indicator">${benchmark}</div>
        `).join('');
    }

    /**
     * Bindet Events für Impact-Level
     */
    bindImpactLevelEvents(kpiValue) {
        const impactLevels = document.querySelectorAll(`[data-kpi="${kpiValue}"]`);
        impactLevels.forEach(levelElement => {
            levelElement.addEventListener('click', () => {
                this.selectImpactLevel(kpiValue, parseInt(levelElement.dataset.level));
            });

            // Keyboard accessibility
            levelElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectImpactLevel(kpiValue, parseInt(levelElement.dataset.level));
                }
            });
        });
    }

    /**
     * Wählt ein Impact-Level aus
     */
    selectImpactLevel(kpiValue, level) {
        // Entferne aktive Klasse von allen Levels dieser KPI
        const allLevels = document.querySelectorAll(`[data-kpi="${kpiValue}"]`);
        allLevels.forEach(el => {
            el.classList.remove('active');
            el.setAttribute('aria-pressed', 'false');
        });

        // Setze aktive Klasse für gewähltes Level
        const selectedLevel = document.querySelector(`[data-kpi="${kpiValue}"][data-level="${level}"]`);
        if (selectedLevel) {
            selectedLevel.classList.add('active');
            selectedLevel.setAttribute('aria-pressed', 'true');
        }

        // Aktualisiere Badge
        const badge = document.getElementById(`kpi-badge-${kpiValue}`);
        const impactLevel = this.impactLevels.find(l => l.level === level);
        if (badge && impactLevel) {
            badge.textContent = impactLevel.label;
            badge.style.background = `linear-gradient(135deg, ${impactLevel.color} 0%, ${this.darkenColor(impactLevel.color, 20)} 100%)`;
        }

        // Aktualisiere Datenmodell
        const kpiIndex = this.selectedKPIs.findIndex(kpi => kpi.value === kpiValue);
        if (kpiIndex !== -1) {
            this.selectedKPIs[kpiIndex].score = impactLevel.score;
            this.selectedKPIs[kpiIndex].level = level;
        }

        this.updateHiddenInput();

        // Visuelles Feedback
        this.showSelectionFeedback(selectedLevel);
    }

    /**
     * Setzt Standard Impact-Level
     */
    setDefaultImpactLevel(kpiValue, level) {
        this.selectImpactLevel(kpiValue, level);
    }

    /**
     * Zeigt visuelles Feedback bei Auswahl
     */
    showSelectionFeedback(element) {
        element.style.transform = 'scale(1.1)';
        setTimeout(() => {
            element.style.transform = '';
        }, 200);
    }

    /**
     * Verdunkelt eine Farbe um einen bestimmten Prozentsatz
     */
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    /**
     * Entfernt eine KPI-Bewertung
     */
    removeKPIAssessment(kpiValue) {
        const assessmentElement = document.getElementById(`kpi-assessment-${kpiValue}`);
        if (assessmentElement) {
            assessmentElement.remove();
        }
    }

    /**
     * Aktualisiert die "Keine KPI ausgewählt" Nachricht
     */
    updateNoKPIMessage() {
        const noKPIMessage = document.querySelector('.no-kpi-selected');
        if (noKPIMessage) {
            noKPIMessage.style.display = this.selectedKPIs.length === 0 ? 'block' : 'none';
        }
    }

    /**
     * Aktualisiert das versteckte Input-Feld
     */
    updateHiddenInput() {
        const hiddenInput = document.getElementById('selectedKpisInput');
        if (hiddenInput) {
            hiddenInput.value = JSON.stringify(this.selectedKPIs);
        }
    }

    /**
     * Behandelt Form-Submission
     */
    handleFormSubmission(event) {
        // Stelle sicher, dass das versteckte Input aktuell ist
        this.updateHiddenInput();

        // Validierung: Mindestens eine KPI muss ausgewählt sein
        if (this.selectedKPIs.length === 0) {
            event.preventDefault();
            this.showValidationError('Bitte wählen Sie mindestens eine KPI aus.');
            return false;
        }

        console.log('KPI Assessment Submission:', {
            selectedKPIs: this.selectedKPIs,
            totalKPIs: this.selectedKPIs.length,
            averageScore: this.calculateAverageScore()
        });

        return true;
    }

    /**
     * Berechnet den durchschnittlichen Score
     */
    calculateAverageScore() {
        if (this.selectedKPIs.length === 0) return 0;
        const totalScore = this.selectedKPIs.reduce((sum, kpi) => sum + kpi.score, 0);
        return totalScore / this.selectedKPIs.length;
    }

    /**
     * Zeigt Validierungsfehler
     */
    showValidationError(message) {
        // Erstelle oder aktualisiere Fehlermeldung
        let errorDiv = document.querySelector('.kpi-validation-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'kpi-validation-error';
            errorDiv.style.cssText = `
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 12px 16px;
                border-radius: 8px;
                margin: 16px 0;
                font-weight: 500;
            `;
            const container = document.getElementById('kpi-sliders-container');
            container.parentNode.insertBefore(errorDiv, container);
        }
        
        errorDiv.textContent = message;
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Entferne Fehlermeldung nach 5 Sekunden
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    /**
     * Öffentliche API für externe Zugriffe
     */
    getSelectedKPIs() {
        return this.selectedKPIs;
    }

    getAverageScore() {
        return this.calculateAverageScore();
    }
}

// Initialisiere die optimierte KPI-Bewertung wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', function() {
    // Prüfe ob wir auf der KPI-Seite sind
    if (document.getElementById('kpi-sliders-container')) {
        window.optimizedKPIAssessment = new OptimizedKPIAssessment();
        
        // Für Rückwärtskompatibilität
        window.selectedKpisList = window.optimizedKPIAssessment.selectedKPIs;
    }
});

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizedKPIAssessment;
}