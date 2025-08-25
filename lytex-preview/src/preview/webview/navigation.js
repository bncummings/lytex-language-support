/**
 * Navigation Functions
 */

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
