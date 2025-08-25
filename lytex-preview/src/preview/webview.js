/**
 * LyTeX Preview Webview Script
 * Handles PDF display and controls for LyTeX document preview
 */

console.log('LyTeX Preview webview loaded');

// ==============================================
// Configuration and Initialization
// ==============================================

/**
 * Initialize PDF.js worker
 */
function initializePDFWorker() {
    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        console.log('PDF.js worker configured');
    } catch (error) {
        console.error('Failed to configure PDF.js worker:', error);
    }
}

// ==============================================
// DOM Element Cache
// ==============================================

const DOM = {
    status: document.getElementById('status'),
    message: document.getElementById('message'),
    placeholder: document.getElementById('placeholder'),
    pdfContainer: document.getElementById('pdf-container'),
    canvas: document.getElementById('pdf-canvas'),
    pageNum: document.getElementById('page-num'),
    pageCount: document.getElementById('page-count'),
    zoomLevel: document.getElementById('zoom-level'),
    
    // Control buttons
    prevPage: document.getElementById('prev-page'),
    nextPage: document.getElementById('next-page'),
    zoomIn: document.getElementById('zoom-in'),
    zoomOut: document.getElementById('zoom-out')
};

// ==============================================
// Application State
// ==============================================

const AppState = {
    pdf: {
        document: null,
        currentPage: 1,
        isRendering: false,
        pendingPageNumber: null,
        scale: 1.6
    },
    
    ui: {
        canvas: DOM.canvas.getContext('2d'),
        devicePixelRatio: window.devicePixelRatio || 1
    },
    
    constants: {
        MIN_SCALE: 0.4,
        SCALE_STEP: 0.2
    }
};

// ==============================================
// UI Management Functions
// ==============================================

/**
 * Display placeholder message and hide PDF container
 * @param {string} message - Message to display
 * @param {string} className - CSS class for styling
 */
function showPlaceholder(message, className = '') {
    DOM.placeholder.style.display = 'block';
    DOM.pdfContainer.style.display = 'none';
    DOM.message.textContent = message;
    DOM.message.className = className;
}

/**
 * Show PDF container and hide placeholder
 */
function showPDF() {
    DOM.placeholder.style.display = 'none';
    DOM.pdfContainer.style.display = 'flex';
}

/**
 * Update the zoom level display
 */
function updateZoomDisplay() {
    const percentage = Math.round(AppState.pdf.scale * 100);
    DOM.zoomLevel.textContent = `${percentage}%`;
}

/**
 * Update page number display
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 */
function updatePageDisplay(currentPage, totalPages) {
    DOM.pageNum.value = currentPage;
    DOM.pageCount.textContent = totalPages;
}

// ==============================================
// PDF Rendering Functions
// ==============================================

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

// ==============================================
// Navigation Functions
// ==============================================

/**
 * Navigate to previous page
 */
function goToPreviousPage() {
    if (AppState.pdf.currentPage <= 1) {
        return;
    }
    
    AppState.pdf.currentPage--;
    queuePageRender(AppState.pdf.currentPage);
}

/**
 * Navigate to next page
 */
function goToNextPage() {
    if (!AppState.pdf.document || AppState.pdf.currentPage >= AppState.pdf.document.numPages) {
        return;
    }
    
    AppState.pdf.currentPage++;
    queuePageRender(AppState.pdf.currentPage);
}

/**
 * Navigate to specific page
 * @param {number} pageNumber - Target page number
 */
function goToPage(pageNumber) {
    if (!AppState.pdf.document) {
        return;
    }
    
    const targetPage = parseInt(pageNumber);
    
    if (targetPage >= 1 && targetPage <= AppState.pdf.document.numPages) {
        AppState.pdf.currentPage = targetPage;
        queuePageRender(AppState.pdf.currentPage);
    }
}

// ==============================================
// Zoom Functions
// ==============================================

/**
 * Increase zoom level
 */
function zoomIn() {
    AppState.pdf.scale += AppState.constants.SCALE_STEP;
    updateZoomDisplay();
    queuePageRender(AppState.pdf.currentPage);
}

/**
 * Decrease zoom level
 */
function zoomOut() {
    if (AppState.pdf.scale <= AppState.constants.MIN_SCALE) {
        return;
    }
    
    AppState.pdf.scale -= AppState.constants.SCALE_STEP;
    updateZoomDisplay();
    queuePageRender(AppState.pdf.currentPage);
}

// ==============================================
// Event Handlers
// ==============================================

/**
 * Set up event listeners for PDF controls
 */
function setupEventListeners() {
    // Navigation controls
    DOM.prevPage.addEventListener('click', goToPreviousPage);
    DOM.nextPage.addEventListener('click', goToNextPage);
    
    // Zoom controls
    DOM.zoomIn.addEventListener('click', zoomIn);
    DOM.zoomOut.addEventListener('click', zoomOut);
    
    // Page number input
    DOM.pageNum.addEventListener('change', function() {
        goToPage(this.value);
    });
    
    // Mouse wheel zoom
    const viewer = document.querySelector('.viewer');
    viewer.addEventListener('wheel', function(event) {
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (event.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        }
    });
    
    // Extension messages
    window.addEventListener('message', event => {
        handleExtensionMessage(event.data);
    });
}

/**
 * Handle messages from the VS Code extension
 * @param {Object} message - Message object from extension
 */
function handleExtensionMessage(message) {
    console.log('Received message:', message);
    
    const messageHandlers = {
        compile: () => {
            DOM.status.textContent = 'Compiling...';
            showPlaceholder('Compiling your LilyPond + LaTeX document...', 'loading');
        },
        
        compiled: () => {
            DOM.status.textContent = 'Compilation complete';
            
            if (message.pdfData) {
                loadPDF(message.pdfData);
            } else {
                showPlaceholder('No PDF data received', 'error');
            }
        },
        
        error: () => {
            DOM.status.textContent = 'Compilation failed';
            const errorMessage = message.error || 'Compilation failed';
            showPlaceholder(errorMessage, 'error');
        },
        
        ready: () => {
            DOM.status.textContent = 'Ready';
        }
    };
    
    const handler = messageHandlers[message.command];
    
    if (handler) {
        handler();
    } else {
        console.log('Unknown command:', message.command);
    }
}

// ==============================================
// Initialization
// ==============================================

/**
 * Initialize the webview application
 */
function initializeApp() {
    initializePDFWorker();
    setupEventListeners();
    updateZoomDisplay();
    showPlaceholder('Waiting for compilation...');
}

// Start the application
initializeApp();
