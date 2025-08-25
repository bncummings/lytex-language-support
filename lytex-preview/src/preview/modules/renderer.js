/**
 * PDF Rendering Functions
 */

/**
 * Render a specific page of the PDF
 * @param {number} pageNumber - Page number to render
 */
function renderPage(pageNumber) {
    if (!AppState.pdf.document) {
        console.error('No PDF document loaded');
        return;
    }

    AppState.pdf.isRendering = true;
    
    AppState.pdf.document.getPage(pageNumber)
        .then(page => {
            const viewport = page.getViewport({ scale: AppState.pdf.scale });
            
            // Calculate high-DPI canvas dimensions
            const pixelRatio = AppState.ui.devicePixelRatio;
            const canvasWidth = viewport.width;
            const canvasHeight = viewport.height;
            
            // Set actual canvas size (accounting for device pixel ratio)
            DOM.canvas.width = canvasWidth * pixelRatio;
            DOM.canvas.height = canvasHeight * pixelRatio;
            
            // Set display size (CSS pixels)
            DOM.canvas.style.width = canvasWidth + 'px';
            DOM.canvas.style.height = canvasHeight + 'px';
            
            // Scale the context to ensure crisp rendering
            AppState.ui.canvas.scale(pixelRatio, pixelRatio);
            
            const renderContext = {
                canvasContext: AppState.ui.canvas,
                viewport: viewport
            };
            
            return page.render(renderContext).promise;
        })
        .then(() => {
            AppState.pdf.isRendering = false;
            
            // Handle pending page render request
            if (AppState.pdf.pendingPageNumber !== null) {
                renderPage(AppState.pdf.pendingPageNumber);
                AppState.pdf.pendingPageNumber = null;
            }
        })
        .catch(error => {
            console.error('Error rendering page:', error);
            AppState.pdf.isRendering = false;
        });
    
    updatePageDisplay(pageNumber, AppState.pdf.document.numPages);
}

/**
 * Queue a page render request (handles concurrent rendering)
 * @param {number} pageNumber - Page number to render
 */
function queuePageRender(pageNumber) {
    if (AppState.pdf.isRendering) {
        AppState.pdf.pendingPageNumber = pageNumber;
    } else {
        renderPage(pageNumber);
    }
}

/**
 * Load PDF from base64 data
 * @param {string} base64Data - Base64 encoded PDF data
 */
function loadPDF(base64Data) {
    console.log('Loading PDF from base64 data...');
    
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
