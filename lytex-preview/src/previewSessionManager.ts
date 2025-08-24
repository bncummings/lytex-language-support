import * as vscode from 'vscode';
import { PreviewSession, SessionManager } from './types';

/* Global state for preview sessions */
const activePreviewSessions = new Map<string, vscode.Disposable>();
const statusBarItems = new Map<string, vscode.StatusBarItem>();
const activeWebviews = new Map<string, vscode.WebviewPanel>();

class PreviewSessionManager implements SessionManager {
    
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
     * Sets up automatic cleanup when the webview is disposed.
     * 
     * @param {PreviewSession} session - The complete preview session object
     */
    createSession(session: PreviewSession): void {
        const filePath = session.filePath;
        
        activePreviewSessions.set(filePath, session.saveWatcher);
        statusBarItems.set(filePath, session.statusBarItem);
        activeWebviews.set(filePath, session.webviewPanel);
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
        
        if (session) {
            session.dispose();
            activePreviewSessions.delete(filePath);
        }
        
        if (statusBarItem) {
            statusBarItem.dispose();
            statusBarItems.delete(filePath);
        }
        
        if (webviewPanel) {
            webviewPanel.dispose();
        }
        
        activeWebviews.delete(filePath);
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
export const sessionManager = new PreviewSessionManager();
