const PDF_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/**
 * Initialize PDF.js worker
 */
function initializePDFWorker() {
    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
        console.log('PDF.js worker configured');
    } catch (error) {
        console.error('Failed to configure PDF.js worker:', error);
    }
}

/**
 * Load PDF from base64 data
 * @param {string} base64Data - Base64 encoded PDF data
 */
function getPDFDocument(base64Data) {
    const pdfDataUri = `data:application/pdf;base64,${base64Data}`;
    
    pdfjsLib.getDocument(pdfDataUri).promise
        .then(pdfDocument => {
            AppState.pdf.document = pdfDocument;
            AppState.pdf.currentPage = 1;
            
            console.log(`PDF loaded successfully, pages: ${pdfDocument.numPages}`);
            
            showPDF();
            renderPage(AppState.pdf.currentPage);
        })
        .catch(error => {
            console.error('Error loading PDF:', error);

            showPlaceholder(`Error loading PDF: ${error.message}`, 'error');
        });
}
