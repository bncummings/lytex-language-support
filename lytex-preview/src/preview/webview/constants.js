/**
 * Application constants and configuration
 */

const Config = {
    PDF_WORKER_URL: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    MIN_SCALE: 0.4,
    SCALE_STEP: 0.2,
    DEFAULT_SCALE: 1.6
};

/**
 * Initialize PDF.js worker
 */
function initializePDFWorker() {
    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = Config.PDF_WORKER_URL;
        console.log('PDF.js worker configured');
    } catch (error) {
        console.error('Failed to configure PDF.js worker:', error);
    }
}
