import * as vscode from 'vscode';

/**
 * Represents a complete preview session for a LyTeX file.
 */
export interface PreviewSession {
    filePath: string;
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
 * Interface for managing preview sessions.
 */
export interface SessionManager {
    hasSession(filePath: string): boolean;
    createSession(session: PreviewSession): void;
    stopSession(filePath: string): void;
    getAllSessionPaths(): string[];
    getSessionCount(): number;
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
