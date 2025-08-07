// Enhanced Result Page JavaScript

function downloadReport() {
    // Show loading state
    const button = event.target.closest('.cta-button');
    if (button) {
        button.classList.add('loading');
    }
    
    // Get data from page elements or use placeholder values
    const scoreElement = document.querySelector('.gauge-score');
    const totalScore = scoreElement ? parseFloat(scoreElement.textContent) / 100 : 0.75;
    
    // Create report data
    const reportData = {
        projectName: 'Effizienz-Analyse',
        totalScore: totalScore,
        timestamp: new Date().toLocaleDateString('de-DE')
    };
    
    // Determine recommendation based on score
    let recommendation = '';
    if (reportData.totalScore >= 0.7) {
        recommendation = 'Gut! Dieses Projekt hat ein hervorragendes Potenzial und sollte priorisiert werden.';
    } else if (reportData.totalScore >= 0.4) {
        recommendation = 'Mittel. Dieses Projekt zeigt solides Potenzial mit einem ausgewogenen Verhältnis von Aufwand und Nutzen.';
    } else {
        recommendation = 'Schlecht. Dieses Projekt hat ein begrenztes Potenzial und sollte strategisch neu ausgerichtet werden.';
    }
    
    // Create report content
    const content = 'Effizienz-Analyse Bericht\n' +
                   '========================\n\n' +
                   'Datum: ' + reportData.timestamp + '\n' +
                   'Gesamtscore: ' + (reportData.totalScore * 100).toFixed(1) + '%\n\n' +
                   'Empfehlung:\n' + recommendation + '\n\n' +
                   'Dieser Bericht wurde automatisch generiert.';
    
    // Create and download file
    try {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'effizienz-analyse-' + new Date().toISOString().split('T')[0] + '.txt';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Download fehlgeschlagen. Bitte versuchen Sie es erneut.');
    }
    
    // Remove loading state
    setTimeout(function() {
        if (button) {
            button.classList.remove('loading');
        }
    }, 1000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for CTA buttons if needed
    const downloadButton = document.querySelector('a[onclick="downloadReport()"]');
    if (downloadButton) {
        downloadButton.addEventListener('click', function(e) {
            e.preventDefault();
            downloadReport();
        });
    }
});