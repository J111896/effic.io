# Step Navigation Integration Guide

## Übersicht

Diese Lösung bietet eine vollständige schrittweise Navigation mit persistentem Zustand für Ihr mehrstufiges Bewertungstool. Die Implementierung unterstützt sowohl Vanilla JavaScript als auch React.

## Dateien

1. **step-navigation.js** - Vanilla JavaScript Implementierung
2. **step-navigation.css** - Styling für alle Komponenten
3. **StepNavigation.jsx** - React Komponenten
4. **integration-guide.md** - Diese Anleitung

## Integration in bestehende Templates

### 1. CSS und JavaScript einbinden

Fügen Sie in Ihre HTML-Templates (technik.html, kpi.html, user_readiness.html) folgende Zeilen im `<head>` Bereich hinzu:

```html
<link rel="stylesheet" href="{{ url_for('static', filename='step-navigation.css') }}">
<script src="{{ url_for('static', filename='step-navigation.js') }}" defer></script>
```

### 2. Template Anpassungen

#### technik.html
```html
<!-- Fügen Sie nach dem Header hinzu -->
<div class="technik-header">
    <h1>Technik-Bewertung</h1>
</div>

<!-- Bestehender Inhalt bleibt unverändert -->

<!-- Navigation Buttons am Ende -->
<div class="navigation-buttons">
    <a href="/" class="back-button">← Zurück zum Start</a>
    <button type="submit" class="forward-button" onclick="window.stepNavigationManager.navigateForward('/kpi_bewertung')">Weiter zur KPI-Bewertung →</button>
</div>
```

#### kpi.html
```html
<!-- Navigation Buttons ersetzen -->
<div class="navigation-buttons">
    <a href="/technik_bewertung" class="back-button">← Zurück</a>
    <button type="submit" class="forward-button" onclick="window.stepNavigationManager.navigateForward('/user_readiness')">Weiter zur User-Bewertung →</button>
</div>
```

#### user_readiness.html
```html
<!-- Navigation Buttons ersetzen -->
<div class="navigation-buttons">
    <a href="/kpi_bewertung" class="back-button">← Zurück</a>
    <button type="submit" class="forward-button" onclick="window.stepNavigationManager.navigateForward('/result')">Zum effic.io Score →</button>
</div>
```

### 3. Flask Route Anpassungen

Keine Änderungen an den Flask Routes erforderlich! Die Lösung arbeitet mit Ihren bestehenden Routes.

## Features

### ✅ Implementierte Funktionen

1. **Schrittweise Navigation**
   - Ein Schritt zurück mit intelligentem Routing
   - Automatische Erkennung der aktuellen Position
   - Kontextuelle Back-Button Labels

2. **Persistenter Zustand**
   - Automatisches Speichern aller Formulardaten
   - Wiederherstellung beim Zurücknavigieren
   - SessionStorage für temporäre Persistenz

3. **Fortschrittsanzeige**
   - Visueller Fortschrittsbalken
   - Schritt-Indikator mit Punkten
   - Aktuelle Position und Gesamtschritte

4. **Auto-Save**
   - Speichert bei jeder Änderung
   - Periodisches Backup (alle 30 Sekunden)
   - Speichern vor Seitenwechsel

5. **Enhanced UX**
   - Smooth Animationen
   - Hover-Effekte
   - Loading States
   - Responsive Design

### 🎯 Spezielle Features für Ihr System

1. **KPI Slider Integration**
   - Speichert und restauriert Slider-Positionen
   - Erhält selectedKpisList Array

2. **Radio Button Persistenz**
   - Alle Ja/Nein/Teilweise Auswahlen bleiben erhalten
   - Funktioniert mit Ihren bestehenden Formularen

3. **Conditional Logic Support**
   - Erhält bedingte Anzeige-Logik
   - Speichert Zwischenzustände

## React Integration (Optional)

Für moderne React-basierte Erweiterungen:

```jsx
import { StepNavigation, useStepNavigation } from './static/StepNavigation.jsx';

const steps = [
    { id: 'technik', name: 'Technik-Bewertung' },
    { id: 'kpi', name: 'KPI-Bewertung' },
    { id: 'user', name: 'Nutzerbereitschaft' }
];

function AssessmentApp() {
    return (
        <StepNavigation
            steps={steps}
            showProgress={true}
            showNavigation={true}
            autoSave={true}
        >
            <YourStepComponent />
        </StepNavigation>
    );
}
```

## Anpassungen und Erweiterungen

### Neue Schritte hinzufügen

1. Erweitern Sie das `steps` Array in `step-navigation.js`:
```javascript
this.steps = [
    { id: 'technik', name: 'Technik-Bewertung', url: '/technik_bewertung', sessionKey: 'technik_evaluation' },
    { id: 'kpi', name: 'KPI-Bewertung', url: '/kpi_bewertung', sessionKey: 'kpi_evaluation' },
    { id: 'user', name: 'Nutzerbereitschaft', url: '/user_readiness', sessionKey: 'user_readiness_evaluation' },
    { id: 'review', name: 'Überprüfung', url: '/review', sessionKey: 'review_data' } // Neuer Schritt
];
```

2. Fügen Sie URL-Erkennung hinzu:
```javascript
getCurrentStepFromURL() {
    const path = window.location.pathname;
    
    if (path.includes('technik')) return 0;
    if (path.includes('kpi')) return 1;
    if (path.includes('user_readiness')) return 2;
    if (path.includes('review')) return 3; // Neue URL
    
    return 0;
}
```

### Styling anpassen

Alle Styles sind in `step-navigation.css` definiert und können einfach angepasst werden:

```css
/* Eigene Farben */
.progress-fill {
    background: linear-gradient(90deg, #your-color, #your-secondary-color);
}

/* Eigene Button-Styles */
.enhanced-back-button {
    background: linear-gradient(135deg, #your-back-color, #your-back-hover);
}
```

## Debugging und Monitoring

### Console Logs aktivieren
```javascript
// In step-navigation.js
console.log('Current step:', this.currentStep);
console.log('Saved data:', savedData);
```

### SessionStorage inspizieren
```javascript
// Browser Console
console.log('Current Step:', sessionStorage.getItem('currentStep'));
console.log('Form Data:', sessionStorage.getItem('formData_technik'));
console.log('All Storage:', {...sessionStorage});
```

## Performance Optimierungen

1. **Lazy Loading**: Große Formulardaten werden nur bei Bedarf geladen
2. **Debounced Saving**: Input-Events werden gedrosselt
3. **Minimal DOM Updates**: Nur notwendige Änderungen werden vorgenommen
4. **Efficient Storage**: Kompakte JSON-Serialisierung

## Browser Kompatibilität

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile Browsers

## Troubleshooting

### Problem: Daten gehen verloren
**Lösung**: Prüfen Sie, ob sessionStorage aktiviert ist und die Schlüssel korrekt gesetzt werden.

### Problem: Back-Button funktioniert nicht
**Lösung**: Stellen Sie sicher, dass die CSS-Klasse `.back-button` vorhanden ist.

### Problem: Fortschrittsanzeige erscheint nicht
**Lösung**: Prüfen Sie, ob das Element `.technik-header` existiert.

## Support und Wartung

Die Lösung ist vollständig modular aufgebaut und kann schrittweise erweitert werden. Alle Komponenten sind dokumentiert und folgen Best Practices für Wartbarkeit und Erweiterbarkeit.

---

**Nächste Schritte:**
1. CSS und JS Dateien in Ihre Templates einbinden
2. Navigation Buttons in Templates anpassen
3. Testen der Funktionalität
4. Optional: React Komponenten für zukünftige Erweiterungen nutzen