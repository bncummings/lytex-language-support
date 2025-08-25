console.log('LyTeX Preview webview loaded');

/**
 * Initialize the webview application
 */
function initializeApp() {
    initializePDFWorker();
    setupEventListeners();
    updateZoomDisplay();
    showPlaceholder('Waiting for compilation...');
}

/* Start the application */
initializeApp();
