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
