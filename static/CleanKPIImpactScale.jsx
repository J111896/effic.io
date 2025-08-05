import React, { useState, useCallback } from 'react';

/**
 * Saubere KPI-Impact-Skala ohne veraltete Komponenten
 * Nur moderne grafische Bewertung mit 5 farblich abgestuften Stufen
 */
const CleanKPIImpactScale = ({ 
  kpiName, 
  kpiIcon, 
  onImpactChange, 
  initialLevel = 3,
  benchmarks = [],
  className = '' 
}) => {
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [isAnimating, setIsAnimating] = useState(false);

  // Impact-Stufen mit klaren Bezeichnungen und Farben
  const impactLevels = [
    {
      level: 1,
      label: 'Minimal',
      description: 'Kaum messbare Verbesserung',
      score: 0.0,
      bgColor: 'bg-red-100',
      borderColor: 'border-red-400',
      activeColor: 'bg-red-500',
      textColor: 'text-red-700'
    },
    {
      level: 2,
      label: 'Gering',
      description: 'Kleine, spürbare Verbesserung',
      score: 0.25,
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-400',
      activeColor: 'bg-orange-500',
      textColor: 'text-orange-700'
    },
    {
      level: 3,
      label: 'Mittel',
      description: 'Deutlich messbare Verbesserung',
      score: 0.5,
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-400',
      activeColor: 'bg-yellow-500',
      textColor: 'text-yellow-700'
    },
    {
      level: 4,
      label: 'Hoch',
      description: 'Starke, signifikante Verbesserung',
      score: 0.75,
      bgColor: 'bg-green-100',
      borderColor: 'border-green-400',
      activeColor: 'bg-green-500',
      textColor: 'text-green-700'
    },
    {
      level: 5,
      label: 'Extrem',
      description: 'Transformative Verbesserung',
      score: 1.0,
      bgColor: 'bg-emerald-100',
      borderColor: 'border-emerald-400',
      activeColor: 'bg-emerald-600',
      textColor: 'text-emerald-700'
    }
  ];

  // Impact-Level auswählen mit Animation
  const selectImpactLevel = useCallback((level) => {
    setIsAnimating(true);
    setSelectedLevel(level);
    
    const impactData = impactLevels.find(l => l.level === level);
    if (onImpactChange && impactData) {
      onImpactChange({
        level,
        score: impactData.score,
        label: impactData.label,
        description: impactData.description
      });
    }

    // Animation zurücksetzen
    setTimeout(() => setIsAnimating(false), 300);
  }, [onImpactChange, impactLevels]);

  const currentImpact = impactLevels.find(l => l.level === selectedLevel);

  return (
    <div className={`bg-white rounded-xl border-2 border-gray-200 p-6 transition-all duration-300 hover:shadow-lg ${className}`}>
      {/* KPI Header - Sauber ohne Tooltip */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{kpiIcon}</span>
          <h3 className="text-lg font-semibold text-gray-800">{kpiName}</h3>
        </div>
        <div className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
          currentImpact ? `${currentImpact.activeColor} text-white` : 'bg-gray-200 text-gray-600'
        }`}>
          {currentImpact?.label || 'Mittel'}
        </div>
      </div>

      {/* Impact-Skala - Nur die neue grafische Version */}
      <div className="space-y-4">
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-4 flex items-center justify-center gap-2">
            <span>🎯</span>
            Erwarteter Impact
          </h4>
        </div>

        {/* Grafische Impact-Punkte */}
        <div className="relative">
          {/* Verbindungslinie */}
          <div className="absolute top-1/2 left-6 right-6 h-1 bg-gradient-to-r from-red-300 via-yellow-300 to-green-400 rounded-full transform -translate-y-1/2 z-0"></div>
          
          {/* Impact-Level */}
          <div className="flex justify-between items-center relative z-10">
            {impactLevels.map((impact) => {
              const isActive = selectedLevel === impact.level;
              const isAnimatingThis = isAnimating && isActive;
              
              return (
                <button
                  key={impact.level}
                  onClick={() => selectImpactLevel(impact.level)}
                  className={`group flex flex-col items-center p-2 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isActive ? 'transform scale-110' : ''
                  } ${
                    isAnimatingThis ? 'animate-pulse' : ''
                  }`}
                  aria-pressed={isActive}
                  title={`${impact.label}: ${impact.description}`}
                >
                  {/* Impact-Punkt */}
                  <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isActive 
                      ? `${impact.activeColor} border-transparent text-white shadow-lg` 
                      : `${impact.bgColor} ${impact.borderColor} ${impact.textColor} hover:scale-110`
                  }`}>
                    {impact.level}
                  </div>
                  
                  {/* Label */}
                  <span className={`mt-2 text-xs font-medium transition-all duration-300 ${
                    isActive ? 'text-gray-800 font-semibold' : 'text-gray-600 group-hover:text-gray-800'
                  }`}>
                    {impact.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Benchmark-Orientierungshilfen */}
        {benchmarks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-5 gap-2 text-xs text-gray-500">
              {benchmarks.map((benchmark, index) => (
                <div key={index} className="text-center leading-tight">
                  {benchmark}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aktuelle Auswahl Beschreibung */}
        {currentImpact && (
          <div className={`mt-4 p-3 rounded-lg transition-all duration-300 ${
            currentImpact.bgColor
          }`}>
            <p className={`text-sm font-medium ${currentImpact.textColor}`}>
              {currentImpact.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Haupt-KPI-Bewertungskomponente für mehrere KPIs
 */
const KPIImpactAssessment = ({ 
  onKPISelectionChange,
  maxKPIs = 3,
  className = '' 
}) => {
  const [selectedKPIs, setSelectedKPIs] = useState([]);
  const [kpiImpacts, setKPIImpacts] = useState({});

  // KPI-Definitionen
  const availableKPIs = {
    'umsatz': {
      name: 'Umsatz',
      icon: '💰',
      benchmarks: ['Keine Änderung', '2-5% Steigerung', '5-10% Steigerung', '10-20% Steigerung', '20%+ Steigerung']
    },
    'kosten': {
      name: 'Kosten',
      icon: '📉',
      benchmarks: ['Keine Einsparung', '5-10% Reduktion', '10-20% Reduktion', '20-35% Reduktion', '35%+ Reduktion']
    },
    'durchlaufzeit': {
      name: 'Durchlaufzeit',
      icon: '⚡',
      benchmarks: ['Keine Verbesserung', '10-20% schneller', '20-40% schneller', '40-60% schneller', '60%+ schneller']
    },
    'co2': {
      name: 'CO₂-Reduktion',
      icon: '🌱',
      benchmarks: ['Keine Reduktion', '5-15% weniger CO₂', '15-25% weniger CO₂', '25-40% weniger CO₂', '40%+ weniger CO₂']
    },
    'kundenbindung': {
      name: 'Kundenbindung',
      icon: '🤝',
      benchmarks: ['Keine Verbesserung', '5-10% höhere Bindung', '10-20% höhere Bindung', '20-30% höhere Bindung', '30%+ höhere Bindung']
    },
    'fehlerrate': {
      name: 'Fehlerrate',
      icon: '🎯',
      benchmarks: ['Keine Reduktion', '10-25% weniger Fehler', '25-50% weniger Fehler', '50-75% weniger Fehler', '75%+ weniger Fehler']
    }
  };

  // KPI-Auswahl behandeln
  const handleKPISelection = useCallback((kpiKey, isSelected) => {
    setSelectedKPIs(prev => {
      let newSelection = [...prev];
      
      if (isSelected) {
        // Prüfe maximale Anzahl
        if (newSelection.length >= maxKPIs) {
          // Entferne älteste Auswahl
          const removed = newSelection.shift();
          // Entferne auch den Impact-Wert
          setKPIImpacts(prevImpacts => {
            const newImpacts = { ...prevImpacts };
            delete newImpacts[removed];
            return newImpacts;
          });
        }
        newSelection.push(kpiKey);
        
        // Setze Standard-Impact
        setKPIImpacts(prev => ({
          ...prev,
          [kpiKey]: {
            level: 3,
            score: 0.5,
            label: 'Mittel',
            description: 'Deutlich messbare Verbesserung'
          }
        }));
      } else {
        newSelection = newSelection.filter(key => key !== kpiKey);
        // Entferne Impact-Wert
        setKPIImpacts(prev => {
          const newImpacts = { ...prev };
          delete newImpacts[kpiKey];
          return newImpacts;
        });
      }
      
      return newSelection;
    });
  }, [maxKPIs]);

  // Impact-Änderung behandeln
  const handleImpactChange = useCallback((kpiKey, impactData) => {
    setKPIImpacts(prev => ({
      ...prev,
      [kpiKey]: impactData
    }));
  }, []);

  // Callback für Parent-Komponente
  React.useEffect(() => {
    if (onKPISelectionChange) {
      const kpiData = selectedKPIs.map(kpiKey => ({
        value: kpiKey,
        name: availableKPIs[kpiKey].name,
        ...kpiImpacts[kpiKey]
      }));
      onKPISelectionChange(kpiData);
    }
  }, [selectedKPIs, kpiImpacts, onKPISelectionChange, availableKPIs]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* KPI-Auswahl */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-700 mb-4 flex items-center gap-2">
          <span>➕</span>
          Wählen Sie bis zu {maxKPIs} relevante KPIs, die durch das Projekt beeinflusst werden.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(availableKPIs).map(([key, kpi]) => {
            const isSelected = selectedKPIs.includes(key);
            const isDisabled = !isSelected && selectedKPIs.length >= maxKPIs;
            
            return (
              <label 
                key={key}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 text-blue-800' 
                    : isDisabled 
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={(e) => handleKPISelection(key, e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-lg">{kpi.icon}</span>
                <span className="font-medium text-sm">{kpi.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* KPI-Impact-Bewertungen */}
      <div className="space-y-4">
        {selectedKPIs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg font-medium">Bitte wählen Sie mindestens eine KPI aus</p>
            <p className="text-sm mt-2">Wählen Sie bis zu {maxKPIs} KPIs aus, um deren erwarteten Impact zu bewerten.</p>
          </div>
        ) : (
          selectedKPIs.map(kpiKey => {
            const kpi = availableKPIs[kpiKey];
            return (
              <CleanKPIImpactScale
                key={kpiKey}
                kpiName={kpi.name}
                kpiIcon={kpi.icon}
                benchmarks={kpi.benchmarks}
                onImpactChange={(impactData) => handleImpactChange(kpiKey, impactData)}
                className="transition-all duration-300 hover:shadow-md"
              />
            );
          })
        )}
      </div>

      {/* Verstecktes Input für Form-Submission */}
      <input
        type="hidden"
        name="selected_kpis"
        value={JSON.stringify(selectedKPIs.map(kpiKey => ({
          value: kpiKey,
          name: availableKPIs[kpiKey].name,
          ...kpiImpacts[kpiKey]
        })))}
      />
    </div>
  );
};

export default KPIImpactAssessment;
export { CleanKPIImpactScale };