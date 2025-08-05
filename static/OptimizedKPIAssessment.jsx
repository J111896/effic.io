import React, { useState, useEffect, useCallback } from 'react';

/**
 * Optimierte KPI-Bewertungskomponente für React
 * Fokus auf Nutzerführung, kognitive Entlastung und moderne UX
 */

const OptimizedKPIAssessment = ({ 
  onKPIChange, 
  maxKPIs = 3, 
  initialKPIs = [],
  className = '' 
}) => {
  const [selectedKPIs, setSelectedKPIs] = useState(initialKPIs);
  const [validationError, setValidationError] = useState('');

  // KPI-Definitionen mit kontextuellen Hinweisen
  const kpiDefinitions = {
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

  // Impact-Level mit klaren Bedeutungen
  const impactLevels = [
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

  // Callback für Änderungen
  useEffect(() => {
    if (onKPIChange) {
      onKPIChange(selectedKPIs);
    }
  }, [selectedKPIs, onKPIChange]);

  // KPI-Auswahl behandeln
  const handleKPISelection = useCallback((kpiValue, isSelected) => {
    setValidationError('');
    
    if (isSelected) {
      setSelectedKPIs(prev => {
        let newKPIs = [...prev];
        
        // Prüfe maximale Anzahl
        if (newKPIs.length >= maxKPIs) {
          // Entferne älteste Auswahl
          newKPIs.shift();
        }
        
        // Füge neue KPI hinzu
        newKPIs.push({
          value: kpiValue,
          name: kpiDefinitions[kpiValue].name,
          score: 0.5, // Standard: mittlerer Impact
          level: 3
        });
        
        return newKPIs;
      });
    } else {
      setSelectedKPIs(prev => prev.filter(kpi => kpi.value !== kpiValue));
    }
  }, [maxKPIs, kpiDefinitions]);

  // Impact-Level auswählen
  const selectImpactLevel = useCallback((kpiValue, level) => {
    const impactLevel = impactLevels.find(l => l.level === level);
    if (!impactLevel) return;

    setSelectedKPIs(prev => 
      prev.map(kpi => 
        kpi.value === kpiValue 
          ? { ...kpi, score: impactLevel.score, level }
          : kpi
      )
    );
  }, [impactLevels]);

  // Durchschnittlichen Score berechnen
  const calculateAverageScore = useCallback(() => {
    if (selectedKPIs.length === 0) return 0;
    const totalScore = selectedKPIs.reduce((sum, kpi) => sum + kpi.score, 0);
    return totalScore / selectedKPIs.length;
  }, [selectedKPIs]);

  // Validierung
  const validateSelection = useCallback(() => {
    if (selectedKPIs.length === 0) {
      setValidationError('Bitte wählen Sie mindestens eine KPI aus.');
      return false;
    }
    setValidationError('');
    return true;
  }, [selectedKPIs]);

  // Tooltip-Komponente
  const Tooltip = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div 
        className="kpi-tooltip"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        {isVisible && (
          <div className="tooltip-content">
            {content}
          </div>
        )}
      </div>
    );
  };

  // Impact-Level-Komponente
  const ImpactLevel = ({ kpiValue, level, isActive, onClick }) => {
    const impactLevel = impactLevels.find(l => l.level === level);
    if (!impactLevel) return null;

    return (
      <div
        className={`impact-level ${isActive ? 'active' : ''}`}
        data-level={level}
        role="button"
        tabIndex={0}
        aria-pressed={isActive}
        title={`${impactLevel.label}: ${impactLevel.description}`}
        onClick={() => onClick(kpiValue, level)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(kpiValue, level);
          }
        }}
        style={{
          '--impact-color': impactLevel.color
        }}
      >
        <div className="impact-point">{level}</div>
        <div className="impact-label">{impactLevel.label}</div>
      </div>
    );
  };

  // KPI-Bewertungskomponente
  const KPIAssessmentItem = ({ kpi }) => {
    const definition = kpiDefinitions[kpi.value];
    const currentLevel = impactLevels.find(l => l.level === kpi.level);

    return (
      <div className="kpi-assessment-item">
        <div className="kpi-assessment-header">
          <div className="kpi-name">
            <span className="kpi-icon">{definition.icon}</span>
            {definition.name}
          </div>
          <div 
            className="kpi-value-badge"
            style={{
              background: `linear-gradient(135deg, ${currentLevel.color} 0%, ${darkenColor(currentLevel.color, 20)} 100%)`
            }}
          >
            {currentLevel.label}
          </div>
          <Tooltip content={definition.tooltip}>
            <div className="tooltip-trigger">?</div>
          </Tooltip>
        </div>
        
        <div className="impact-scale-container">
          <div className="impact-scale-title">
            <span>🎯</span>
            Erwarteter Impact
          </div>
          
          <div className="impact-scale">
            <div className="impact-line"></div>
            {impactLevels.map(level => (
              <ImpactLevel
                key={level.level}
                kpiValue={kpi.value}
                level={level.level}
                isActive={kpi.level === level.level}
                onClick={selectImpactLevel}
              />
            ))}
          </div>
          
          <div className="benchmark-indicators">
            {definition.benchmarks.map((benchmark, index) => (
              <div key={index} className="benchmark-indicator">
                {benchmark}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Hilfsfunktion zum Verdunkeln von Farben
  const darkenColor = (color, percent) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  return (
    <div className={`kpi-assessment-container ${className}`}>
      {/* KPI-Auswahl */}
      <div className="kpi-selection">
        <p>➕ Wählen Sie bis zu {maxKPIs} relevante KPIs, die durch das Projekt beeinflusst werden.</p>
        <div className="kpi-checkboxes">
          {Object.entries(kpiDefinitions).map(([value, definition]) => {
            const isSelected = selectedKPIs.some(kpi => kpi.value === value);
            const isDisabled = !isSelected && selectedKPIs.length >= maxKPIs;
            
            return (
              <label 
                key={value} 
                className={`kpi-checkbox ${isDisabled ? 'disabled' : ''}`}
              >
                <input
                  type="checkbox"
                  value={value}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={(e) => handleKPISelection(value, e.target.checked)}
                  className="kpi-select-box"
                />
                <span>
                  {definition.icon} {definition.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Validierungsfehler */}
      {validationError && (
        <div className="kpi-validation-error">
          {validationError}
        </div>
      )}

      {/* KPI-Bewertungen */}
      <div className="kpi-assessments">
        {selectedKPIs.length === 0 ? (
          <div className="no-kpi-selected">
            Bitte wählen Sie mindestens eine KPI aus.
          </div>
        ) : (
          selectedKPIs.map(kpi => (
            <KPIAssessmentItem key={kpi.value} kpi={kpi} />
          ))
        )}
      </div>

      {/* Zusammenfassung */}
      {selectedKPIs.length > 0 && (
        <div className="kpi-summary">
          <div className="summary-item">
            <span className="summary-label">Ausgewählte KPIs:</span>
            <span className="summary-value">{selectedKPIs.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Durchschnittlicher Impact:</span>
            <span className="summary-value">
              {impactLevels.find(l => Math.abs(l.score - calculateAverageScore()) < 0.13)?.label || 'Mittel'}
            </span>
          </div>
        </div>
      )}

      {/* Verstecktes Input für Form-Submission */}
      <input
        type="hidden"
        name="selected_kpis"
        value={JSON.stringify(selectedKPIs)}
      />

      <style jsx>{`
        .kpi-assessment-container {
          margin-top: 20px;
          padding: 0;
          width: 100%;
        }

        .kpi-checkbox.disabled {
          opacity: 0.5;
          pointer-events: none;
        }

        .kpi-validation-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin: 16px 0;
          font-weight: 500;
        }

        .kpi-summary {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          margin-top: 20px;
          display: flex;
          gap: 24px;
          justify-content: center;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .summary-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .summary-value {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }

        .impact-level {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .impact-level[data-level="1"] .impact-point {
          border-color: var(--impact-color, #ef4444);
          background: #fef2f2;
        }

        .impact-level[data-level="1"].active .impact-point {
          background: var(--impact-color, #ef4444);
          color: white;
        }

        .impact-level[data-level="2"] .impact-point {
          border-color: var(--impact-color, #f59e0b);
          background: #fffbeb;
        }

        .impact-level[data-level="2"].active .impact-point {
          background: var(--impact-color, #f59e0b);
          color: white;
        }

        .impact-level[data-level="3"] .impact-point {
          border-color: var(--impact-color, #eab308);
          background: #fefce8;
        }

        .impact-level[data-level="3"].active .impact-point {
          background: var(--impact-color, #eab308);
          color: white;
        }

        .impact-level[data-level="4"] .impact-point {
          border-color: var(--impact-color, #22c55e);
          background: #f0fdf4;
        }

        .impact-level[data-level="4"].active .impact-point {
          background: var(--impact-color, #22c55e);
          color: white;
        }

        .impact-level[data-level="5"] .impact-point {
          border-color: var(--impact-color, #16a34a);
          background: #f0fdf4;
        }

        .impact-level[data-level="5"].active .impact-point {
          background: var(--impact-color, #16a34a);
          color: white;
        }

        @media (max-width: 768px) {
          .kpi-summary {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

// Hook für KPI-Bewertung
export const useKPIAssessment = (initialKPIs = []) => {
  const [kpis, setKPIs] = useState(initialKPIs);
  
  const addKPI = useCallback((kpi) => {
    setKPIs(prev => [...prev, kpi]);
  }, []);
  
  const removeKPI = useCallback((kpiValue) => {
    setKPIs(prev => prev.filter(kpi => kpi.value !== kpiValue));
  }, []);
  
  const updateKPI = useCallback((kpiValue, updates) => {
    setKPIs(prev => 
      prev.map(kpi => 
        kpi.value === kpiValue ? { ...kpi, ...updates } : kpi
      )
    );
  }, []);
  
  const getAverageScore = useCallback(() => {
    if (kpis.length === 0) return 0;
    const totalScore = kpis.reduce((sum, kpi) => sum + kpi.score, 0);
    return totalScore / kpis.length;
  }, [kpis]);
  
  const validate = useCallback(() => {
    return kpis.length > 0;
  }, [kpis]);
  
  return {
    kpis,
    setKPIs,
    addKPI,
    removeKPI,
    updateKPI,
    getAverageScore,
    validate
  };
};

export default OptimizedKPIAssessment;