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
