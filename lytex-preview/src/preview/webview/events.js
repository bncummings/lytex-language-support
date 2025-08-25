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
    
    // Mouse wheel zoom and horizontal scroll
    const viewer = document.querySelector('.viewer');
    viewer.addEventListener('wheel', function(event) {
        if (event.ctrlKey || event.metaKey) {
            // Zoom with Ctrl/Cmd + wheel
            event.preventDefault();
            if (event.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        } else if (event.shiftKey) {
            // Horizontal scroll with Shift + wheel
            event.preventDefault();
            viewer.scrollLeft += event.deltaY;
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
