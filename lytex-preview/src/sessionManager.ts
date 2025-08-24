import * as vscode from 'vscode';

/* Global state for preview sessions */
const activePreviewSessions = new Map<string, vscode.Disposable>();
const statusBarItems = new Map<string, vscode.StatusBarItem>();
const activeWebviews = new Map<string, vscode.WebviewPanel>();
const webviewDisposedFlags = new Map<string, boolean>();

export class SessionManager {
    
    /**
     * Checks if a preview session exists for the given file path.
     * 
     * @param {string} filePath - The absolute path to the LyTeX file
     * @returns {boolean} True if a session exists, false otherwise
     */
    hasSession(filePath: string): boolean {
        return activePreviewSessions.has(filePath);
    }
    
    /**
     * Creates a new preview session with associated resources.
     * 
     * @param {string} filePath - The absolute path to the LyTeX file
     * @param {vscode.Disposable} saveWatcher - The file watcher for save events
     * @param {vscode.StatusBarItem} statusBarItem - The status bar item for this session
     * @param {vscode.WebviewPanel} webviewPanel - The webview panel for PDF display
     */
    createSession(filePath: string, saveWatcher: vscode.Disposable, statusBarItem: vscode.StatusBarItem, webviewPanel: vscode.WebviewPanel): void {
        activePreviewSessions.set(filePath, saveWatcher);
        statusBarItems.set(filePath, statusBarItem);
        activeWebviews.set(filePath, webviewPanel);
    }
    
    /**
     * Retrieves the webview panel for a given file path.
     * 
     * @param {string} filePath - The absolute path to the LyTeX file
     * @returns {vscode.WebviewPanel | undefined} The webview panel or undefined if not found
     */
    getWebview(filePath: string): vscode.WebviewPanel | undefined {
        return activeWebviews.get(filePath);
    }
    
    /**
     * Marks a webview as disposed to prevent double-disposal.
     * 
     * @param {string} filePath - The absolute path to the LyTeX file
     */
    markWebviewDisposed(filePath: string): void {
        webviewDisposedFlags.set(filePath, true);
    }
    
    /**
     * Checks if a webview has been disposed.
     * 
     * @param {string} filePath - The absolute path to the LyTeX file
     * @returns {boolean} True if the webview has been disposed, false otherwise
     */
    isWebviewDisposed(filePath: string): boolean {
        return webviewDisposedFlags.get(filePath) || false;
    }
    
    /**
     * Stops a preview session and cleans up all associated resources.
     * 
     * @param {string} filePath - The absolute path to the LyTeX file
     */
    stopSession(filePath: string): void {
        const session = activePreviewSessions.get(filePath);
        const statusBarItem = statusBarItems.get(filePath);
        const webviewPanel = activeWebviews.get(filePath);
        const isWebviewDisposed = this.isWebviewDisposed(filePath);
        
        if (session) {
            session.dispose();
            activePreviewSessions.delete(filePath);
        }
        
        if (statusBarItem) {
            statusBarItem.dispose();
            statusBarItems.delete(filePath);
        }
        
        /* Only dispose webview if it hasn't been disposed already */
        if (webviewPanel && !isWebviewDisposed) {
            webviewPanel.dispose();
        }
        
        activeWebviews.delete(filePath);
        webviewDisposedFlags.delete(filePath);
    }
    /**
     * Gets all active session file paths.
     * 
     * @returns {string[]} Array of file paths with active sessions
     */
    getAllSessionPaths(): string[] {
        return Array.from(activePreviewSessions.keys());
    }
    
    /**
     * Gets the count of active preview sessions.
     * 
     * @returns {number} Number of active sessions
     */
    getSessionCount(): number {
        return activePreviewSessions.size;
    }
    
    /**
     * Cleans up all active preview sessions and associated resources.
     */
    cleanup(): void {
        for (const [filePath] of activePreviewSessions) {
            this.stopSession(filePath);
        }
        
        activePreviewSessions.clear();
        statusBarItems.clear();
        activeWebviews.clear();
        webviewDisposedFlags.clear();
    }
    
    /**
     * Sends a message to the webview for a given file path.
     * 
     * @param {string} filePath - The absolute path to the LyTeX file
     * @param {any} message - The message to send to the webview
     * @returns {boolean} True if message was sent successfully, false if webview not found
     */
    sendMessageToWebview(filePath: string, message: any): boolean {
        const webview = activeWebviews.get(filePath);
        if (webview) {
            webview.webview.postMessage(message);
            return true;
        }
        return false;
    }
}

/**
 * Singleton instance of SessionManager for managing LyTeX preview sessions.
 * This is the main entry point for session management throughout the extension.
 * 
 * @type {SessionManager}
 */
export const sessionManager = new SessionManager();
