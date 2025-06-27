document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM vollständig geladen");
    
    // KPI-Auswahl-Funktionalität
    // Note: This functionality is now handled in kpi.html with window.selectedKpisList
    // We'll keep this code for backward compatibility but ensure it doesn't interfere
    const kpiCheckboxes = document.querySelectorAll('.kpi-select-box');
    const kpiSlidersContainer = document.getElementById('kpi-sliders-container');
    const maxKPIs = 3; // Maximale Anzahl an auswählbaren KPIs
    let selectedKPIs = [];
    
    // Event-Listener für KPI-Checkboxen
    if (kpiCheckboxes.length > 0 && kpiSlidersContainer) {
        kpiCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    // Prüfen, ob bereits 3 KPIs ausgewählt sind
                    if (selectedKPIs.length >= maxKPIs) {
                        // Wenn ja, die älteste Auswahl deaktivieren
                        const oldestKPI = selectedKPIs.shift();
                        document.querySelector(`.kpi-select-box[value="${oldestKPI}"]`).checked = false;
                        // Den entsprechenden Slider entfernen
                        const sliderToRemove = document.getElementById(`kpi-slider-${oldestKPI}`);
                        if (sliderToRemove) {
                            sliderToRemove.remove();
                        }
                    }
                    // Neuen KPI hinzufügen
                    selectedKPIs.push(this.value);
                    // Slider für diesen KPI erstellen
                    createKPISlider(this.value, this.nextElementSibling.textContent);
                } else {
                    // KPI aus der Liste entfernen
                    const index = selectedKPIs.indexOf(this.value);
                    if (index > -1) {
                        selectedKPIs.splice(index, 1);
                    }
                    // Slider entfernen
                    const sliderToRemove = document.getElementById(`kpi-slider-${this.value}`);
                    if (sliderToRemove) {
                        sliderToRemove.remove();
                    }
                }
                
                // Hinweis anzeigen, wenn keine KPIs ausgewählt sind
                const noKPIMessage = document.querySelector('.no-kpi-selected');
                if (noKPIMessage) {
                    noKPIMessage.style.display = selectedKPIs.length === 0 ? 'block' : 'none';
                }
            });
        });
    }
    
    // Funktion zum Erstellen eines KPI-Sliders
    function createKPISlider(kpiValue, kpiName) {
        const sliderDiv = document.createElement('div');
        sliderDiv.id = `kpi-slider-${kpiValue}`;
        sliderDiv.className = 'kpi-slider-item';
        
        sliderDiv.innerHTML = `
            <div class="kpi-slider-header">
                <span>${kpiName}</span>
                <span class="kpi-value-display" id="kpi-value-${kpiValue}">3</span>
            </div>
            <div class="slider-container">
                <input type="range" id="kpi-${kpiValue}" name="kpi_${kpiValue}" min="1" max="5" value="3" class="slider kpi-slider">
                <div class="slider-labels">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                </div>
                <div class="slider-descriptions">
                    <span>Keine spürbare Verbesserung</span>
                    <span class="slider-description-end">Signifikante Verbesserung</span>
                </div>
            </div>
        `;
        
        // Hinweis ausblenden, wenn Slider hinzugefügt werden
        const noKPIMessage = document.querySelector('.no-kpi-selected');
        if (noKPIMessage) {
            noKPIMessage.style.display = 'none';
        }
        
        // Slider zum Container hinzufügen
        kpiSlidersContainer.appendChild(sliderDiv);
        
        // Event-Listener für den neuen Slider
        const newSlider = document.getElementById(`kpi-${kpiValue}`);
        if (newSlider) {
            newSlider.addEventListener('input', function() {
                const valueDisplay = document.getElementById(`kpi-value-${kpiValue}`);
                if (valueDisplay) {
                    valueDisplay.textContent = this.value;
                }
            });
        }
    }
    
    // Slider-Funktionalität für ROI-Potenzial
    const roiPotentialSlider = document.getElementById('roi-potential');
    if (roiPotentialSlider) {
        roiPotentialSlider.addEventListener('input', function() {
            updateSliderLabels(this, 'roi-potential-value');
        });
        // Initialen Wert setzen
        updateSliderLabels(roiPotentialSlider, 'roi-potential-value');
    }
    
    // Funktion zum Aktualisieren der Slider-Labels
    function updateSliderLabels(slider, valueId) {
        const value = slider.value;
        const min = slider.min;
        const max = slider.max;
        
        // Berechne die Position des Sliders in Prozent
        const position = ((value - min) / (max - min)) * 100;
        
        // Aktualisiere den visuellen Indikator (falls vorhanden)
        const valueDisplay = document.getElementById(valueId);
        if (valueDisplay) {
            if (slider.id === 'roi-potential') {
                valueDisplay.textContent = `${value}%`;
            } else {
                valueDisplay.textContent = value;
            }
        }
        
        // Hervorheben der ausgewählten Label-Beschreibung
        if (slider.id === 'roi-potential') {
            highlightROIDescription(value);
        } else if (slider.id === 'kpi-improvement') {
            highlightKPIDescription(value);
        }
    }
    
    // Funktion zum Hervorheben der ROI-Beschreibung basierend auf dem Slider-Wert
    function highlightROIDescription(value) {
        const descriptions = document.querySelectorAll('#roi-potential + .slider-labels + .slider-descriptions span');
        if (descriptions.length === 0) return;
        
        // Entferne Hervorhebung von allen Beschreibungen
        descriptions.forEach(desc => desc.classList.remove('active-description'));
        
        // Bestimme, welche Beschreibung hervorgehoben werden soll
        let index = 0;
        if (value <= 20) index = 0; // Kein ROI
        else if (value <= 40) index = 1; // Gering
        else if (value <= 60) index = 2; // Solide
        else if (value <= 80) index = 3; // Hoch
        else index = 4; // Gamechanger
        
        // Füge Hervorhebung zur entsprechenden Beschreibung hinzu
        if (descriptions[index]) {
            descriptions[index].classList.add('active-description');
        }
    }
    
    // Funktion zum Hervorheben der KPI-Beschreibung basierend auf dem Slider-Wert
    function highlightKPIDescription(value) {
        // Hier könnte eine ähnliche Logik wie bei highlightROIDescription implementiert werden,
        // falls die KPI-Verbesserung mehrere Beschreibungen hat
    }
    
    // Strategische Relevanz Button-Funktionalität
    const strategicButtons = document.querySelectorAll('.strategic-button input[type="radio"]');
    strategicButtons.forEach(button => {
        button.addEventListener('change', function() {
            // Hier könnte zusätzliche Logik implementiert werden, wenn ein Button ausgewählt wird
            console.log("Strategische Relevanz ausgewählt:", this.value);
        });
    });
    
    // Formular-Validierung
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(event) {
            // Hier könnte eine Validierungslogik implementiert werden
            console.log("Formular wird abgesendet");
            
            // Stelle sicher, dass das selectedKpisInput aktualisiert wird, falls es existiert
            const selectedKpisInput = document.getElementById('selectedKpisInput');
            if (selectedKpisInput) {
                // Check if we have the global selectedKpisList from kpi.html
                if (window.selectedKpisList) {
                    console.log("Aktualisiere selectedKpisInput vor dem Absenden mit window.selectedKpisList");
                    selectedKpisInput.value = JSON.stringify(window.selectedKpisList);
                    console.log("Aktualisierter Wert:", selectedKpisInput.value);
                } else {
                    // Fallback to the local selectedKPIs array if window.selectedKpisList is not available
                    console.log("Fallback: Aktualisiere selectedKpisInput mit lokalem selectedKPIs Array");
                    // Convert the simple array to the format expected by the server
                    const kpiObjects = selectedKPIs.map(kpiValue => {
                        const slider = document.getElementById(`kpi-${kpiValue}`);
                        const position = slider ? parseInt(slider.value) : 3;
                        // Use the same normalization function as in kpi.html
                        const score = position === 1 ? 0.0 :
                                     position === 2 ? 0.25 :
                                     position === 3 ? 0.5 :
                                     position === 4 ? 0.75 :
                                     position === 5 ? 1.0 : 0.5;
                        
                        return {
                            value: kpiValue,
                            text: document.querySelector(`.kpi-select-box[value="${kpiValue}"]`).nextElementSibling.textContent,
                            position: position,
                            score: score
                        };
                    });
                    
                    selectedKpisInput.value = JSON.stringify(kpiObjects);
                    console.log("Aktualisierter Wert (Fallback):", selectedKpisInput.value);
                }
            }
        });
    }
});