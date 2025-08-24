import * as vscode from 'vscode';

/* Global state for preview sessions */
const activePreviewSessions = new Map<string, vscode.Disposable>();
const statusBarItems = new Map<string, vscode.StatusBarItem>();
const activeWebviews = new Map<string, vscode.WebviewPanel>();
const webviewDisposedFlags = new Map<string, boolean>();

export class SessionManager {
    
    hasSession(filePath: string): boolean {
        return activePreviewSessions.has(filePath);
    }
    
    createSession(filePath: string, saveWatcher: vscode.Disposable, statusBarItem: vscode.StatusBarItem, webviewPanel: vscode.WebviewPanel): void {
        activePreviewSessions.set(filePath, saveWatcher);
        statusBarItems.set(filePath, statusBarItem);
        activeWebviews.set(filePath, webviewPanel);
    }
    
    getWebview(filePath: string): vscode.WebviewPanel | undefined {
        return activeWebviews.get(filePath);
    }
    
    markWebviewDisposed(filePath: string): void {
        webviewDisposedFlags.set(filePath, true);
    }
    
    isWebviewDisposed(filePath: string): boolean {
        return webviewDisposedFlags.get(filePath) || false;
    }
    
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
        
        // Only dispose webview if it hasn't been disposed already
        if (webviewPanel && !isWebviewDisposed) {
            webviewPanel.dispose();
        }
        
        // Clean up tracking maps
        activeWebviews.delete(filePath);
        webviewDisposedFlags.delete(filePath);
    }
    
    getAllSessionPaths(): string[] {
        return Array.from(activePreviewSessions.keys());
    }
    
    getSessionCount(): number {
        return activePreviewSessions.size;
    }
    
    cleanup(): void {
        for (const [filePath] of activePreviewSessions) {
            this.stopSession(filePath);
        }
        
        activePreviewSessions.clear();
        statusBarItems.clear();
        activeWebviews.clear();
        webviewDisposedFlags.clear();
    }
    
    sendMessageToWebview(filePath: string, message: any): boolean {
        const webview = activeWebviews.get(filePath);
        if (webview) {
            webview.webview.postMessage(message);
            return true;
        }
        return false;
    }
}

// Export singleton instance
export const sessionManager = new SessionManager();
