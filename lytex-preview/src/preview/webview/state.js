/**
 * DOM Element Cache and State Management
 */
const DOM = {
    status: document.getElementById('status'),
    message: document.getElementById('message'),
    placeholder: document.getElementById('placeholder'),
    pdfContainer: document.getElementById('pdf-container'),
    canvas: document.getElementById('pdf-canvas'),
    pageNum: document.getElementById('page-num'),
    pageCount: document.getElementById('page-count'),
    zoomLevel: document.getElementById('zoom-level'),
    prevPage: document.getElementById('prev-page'),
    nextPage: document.getElementById('next-page'),
    zoomIn: document.getElementById('zoom-in'),
    zoomOut: document.getElementById('zoom-out')
};

const AppState = {
    pdf: {
        document: null,
        currentPage: 1,
        isRendering: false,
        pendingPageNumber: null,
        scale: Config.DEFAULT_SCALE
    },
    
    ui: {
        canvas: DOM.canvas.getContext('2d'),
        devicePixelRatio: window.devicePixelRatio || 1
    },
    
    constants: {
        MIN_SCALE: Config.MIN_SCALE,
        SCALE_STEP: Config.SCALE_STEP
    }
};
