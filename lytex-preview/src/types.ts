import * as vscode from 'vscode';

/**
 * Represents a complete preview session for a LyTeX file.
 */
export interface PreviewSession {
    filePath: string;
    baseName: string;
    saveWatcher: vscode.Disposable;
    statusBarItem: vscode.StatusBarItem;
    webviewPanel: vscode.WebviewPanel;
}

/**
 * Represents a message sent to or from the webview.
 */
export interface WebviewMessage {
    command: string;
    data?: any;
}

/**
 * Interface for managing preview sessions (not currently used by the concrete SessionManager class).
 */
export interface SessionManager {
    hasSession(filePath: string): boolean;
    createSession(filePath: string, session: PreviewSession): void;
    getSession(filePath: string): PreviewSession | undefined;
    removeSession(filePath: string): void;
    getAllSessions(): Map<string, PreviewSession>;
    cleanup(): void;
}

/**
 * Represents the result of a LyTeX compilation operation.
 */
export interface CompileResult {
    success: boolean;
    pdfPath?: string;
    error?: string;
    stdout?: string;
    stderr?: string;
}
