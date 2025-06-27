/**
 * Result Gauge Visualization
 * Handles the gauge/traffic light visualization for the result page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize gauge visualization
    initGauge();
    
    // Initialize tooltips
    initTooltips();
    
    // Initialize detail boxes
    initDetailBoxes();
});

/**
 * Initialize the gauge visualization based on the score
 */
function initGauge() {
    const gaugeContainer = document.querySelector('.gauge-container');
    if (!gaugeContainer) return;
    
    const gaugePointer = gaugeContainer.querySelector('.gauge-pointer');
    if (!gaugePointer) return;
    
    // Score aus dem data-score Attribut des Pointers auslesen
    const score = parseFloat(gaugePointer.getAttribute('data-score'));
    if (isNaN(score)) return;
    
    const gaugeMeter = gaugeContainer.querySelector('.gauge-meter');
    const gaugeValue = gaugeContainer.querySelector('.gauge-value');
    const gaugeUncertainty = gaugeContainer.querySelector('.gauge-uncertainty');
    
    // Set the gauge value
    if (gaugeValue) {
        gaugeValue.textContent = score.toFixed(2);
    }
    
    // Position the pointer based on score (0-1)
    if (gaugePointer && gaugeMeter) {
        const meterWidth = gaugeMeter.offsetWidth;
        const pointerPosition = score * meterWidth;
        gaugePointer.style.left = `${pointerPosition}px`;
        // Füge eine kleine Animation hinzu, um den Pointer hervorzuheben
        setTimeout(() => {
            gaugePointer.style.boxShadow = '0 0 5px rgba(0,0,0,0.8)';
        }, 500);
    }
    
    // Set uncertainty range if available
    if (gaugeUncertainty) {
        const uncertaintyRange = 0.1; // Default 10% uncertainty
        const meterWidth = gaugeMeter.offsetWidth;
        const uncertaintyWidth = uncertaintyRange * meterWidth;
        const uncertaintyPosition = (score * meterWidth) - (uncertaintyWidth / 2);
        
        gaugeUncertainty.style.width = `${uncertaintyWidth}px`;
        gaugeUncertainty.style.left = `${Math.max(0, uncertaintyPosition)}px`;
    }
    
    // Update color class based on score
    updateScoreColor(score);
}

/**
 * Update color indicators based on score
 */
function updateScoreColor(score) {
    let statusClass = '';
    
    if (score >= 0.8) {
        statusClass = 'status-green';
    } else if (score >= 0.5) {
        statusClass = 'status-yellow';
    } else {
        statusClass = 'status-red';
    }
    
    // Update module status indicators
    document.querySelectorAll('.module-status').forEach(indicator => {
        const moduleScore = parseFloat(indicator.dataset.score || 0);
        
        indicator.classList.remove('status-red', 'status-yellow', 'status-green');
        
        if (moduleScore >= 0.8) {
            indicator.classList.add('status-green');
        } else if (moduleScore >= 0.5) {
            indicator.classList.add('status-yellow');
        } else {
            indicator.classList.add('status-red');
        }
    });
}

/**
 * Initialize tooltips functionality
 */
function initTooltips() {
    const tooltipTriggers = document.querySelectorAll('.tooltip-trigger');
    
    tooltipTriggers.forEach(trigger => {
        const tooltipId = trigger.dataset.tooltip;
        const tooltip = document.getElementById(tooltipId);
        
        if (tooltip) {
            trigger.addEventListener('mouseenter', () => {
                tooltip.style.display = 'block';
            });
            
            trigger.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
        }
    });
}

/**
 * Initialize detail boxes toggle functionality
 */
function initDetailBoxes() {
    const detailButtons = document.querySelectorAll('.detail-toggle');
    
    detailButtons.forEach(button => {
        const detailBoxId = button.dataset.target;
        const detailBox = document.getElementById(detailBoxId);
        
        if (detailBox) {
            button.addEventListener('click', () => {
                const isVisible = detailBox.style.display === 'block';
                detailBox.style.display = isVisible ? 'none' : 'block';
                button.textContent = isVisible ? 'Details anzeigen' : 'Details ausblenden';
            });
        }
    });
}