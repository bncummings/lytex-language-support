console.log('LyTeX Preview webview loaded');

// Configure PDF.js worker
try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    console.log('PDF.js worker configured');
} catch (error) {
    console.error('Failed to configure PDF.js worker:', error);
}

// DOM Elements
const elements = {
    status: document.getElementById('status'),
    message: document.getElementById('message'),
    placeholder: document.getElementById('placeholder'),
    pdfContainer: document.getElementById('pdf-container'),
    canvas: document.getElementById('pdf-canvas'),
    pageNum: document.getElementById('page-num'),
    pageCount: document.getElementById('page-count'),
    zoomLevel: document.getElementById('zoom-level')
};

// PDF State
const pdfState = {
    doc: null,
    pageNum: 1,
    pageRendering: false,
    pageNumPending: null,
    scale: 1.6
};

const ctx = elements.canvas.getContext('2d');

// ==============================================
// UI Control Functions
// ==============================================
function showPlaceholder(message, className = '') {
    elements.placeholder.style.display = 'block';
    elements.pdfContainer.style.display = 'none';
    elements.message.textContent = message;
    elements.message.className = className;
}

function showPDF() {
    elements.placeholder.style.display = 'none';
    elements.pdfContainer.style.display = 'flex';
}

function updateZoomDisplay() {
    elements.zoomLevel.textContent = Math.round(pdfState.scale * 100) + '%';
}

// ==============================================
// PDF Rendering Functions
// ==============================================
function renderPage(num) {
    pdfState.pageRendering = true;
    
    pdfState.doc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale: pdfState.scale });
        elements.canvas.height = viewport.height;
        elements.canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        page.render(renderContext).promise.then(() => {
            pdfState.pageRendering = false;
            if (pdfState.pageNumPending !== null) {
                renderPage(pdfState.pageNumPending);
                pdfState.pageNumPending = null;
            }
        });
    });
    
    elements.pageNum.value = num;
}

function queueRenderPage(num) {
    if (pdfState.pageRendering) {
        pdfState.pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function loadPDF(base64Data) {
    console.log('Loading PDF from base64 data...');
    
    const pdfData = 'data:application/pdf;base64,' + base64Data;
    
    pdfjsLib.getDocument(pdfData).promise
        .then(pdf => {
            pdfState.doc = pdf;
            elements.pageCount.textContent = pdf.numPages;
            
            console.log('PDF loaded successfully, pages:', pdf.numPages);
            showPDF();
            renderPage(pdfState.pageNum);
        })
        .catch(error => {
            console.error('Error loading PDF:', error);
            showPlaceholder('Error loading PDF: ' + error.message, 'error');
        });
}

// ==============================================
// Event Handlers
// ==============================================
function setupPDFControls() {
    // Navigation
    document.getElementById('prev-page').addEventListener('click', () => {
        if (pdfState.pageNum <= 1) return;
        pdfState.pageNum--;
        queueRenderPage(pdfState.pageNum);
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        if (pdfState.pageNum >= pdfState.doc.numPages) return;
        pdfState.pageNum++;
        queueRenderPage(pdfState.pageNum);
    });
    
    // Zoom
    document.getElementById('zoom-in').addEventListener('click', () => {
        pdfState.scale += 0.2;
        updateZoomDisplay();
        queueRenderPage(pdfState.pageNum);
    });
    
    document.getElementById('zoom-out').addEventListener('click', () => {
        if (pdfState.scale <= 0.4) return;
        pdfState.scale -= 0.2;
        updateZoomDisplay();
        queueRenderPage(pdfState.pageNum);
    });
    
    // Page input
    elements.pageNum.addEventListener('change', function() {
        const num = parseInt(this.value);
        if (num >= 1 && num <= pdfState.doc.numPages) {
            pdfState.pageNum = num;
            queueRenderPage(pdfState.pageNum);
        }
    });
}

function handleExtensionMessage(message) {
    console.log('Received message:', message);
    
    switch (message.command) {
        case 'compile':
            elements.status.textContent = 'Compiling...';
            showPlaceholder('Compiling your LilyPond + LaTeX document...', 'loading');
            break;
            
        case 'compiled':
            elements.status.textContent = 'Compilation complete';
            if (message.pdfData) {
                loadPDF(message.pdfData);
            } else {
                showPlaceholder('No PDF data received', 'error');
            }
            break;
            
        case 'error':
            elements.status.textContent = 'Compilation failed';
            showPlaceholder(message.error || 'Compilation failed', 'error');
            break;
            
        case 'ready':
            elements.status.textContent = 'Ready';
            break;
            
        default:
            console.log('Unknown command:', message.command);
    }
}

// ==============================================
// Initialization
// ==============================================
window.addEventListener('message', event => handleExtensionMessage(event.data));
setupPDFControls();
updateZoomDisplay();
showPlaceholder('Waiting for compilation...');
