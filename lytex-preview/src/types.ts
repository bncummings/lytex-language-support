import * as vscode from 'vscode';

export interface PreviewSession {
    filePath: string;
    baseName: string;
    saveWatcher: vscode.Disposable;
    statusBarItem: vscode.StatusBarItem;
    webviewPanel: vscode.WebviewPanel;
}

export interface WebviewMessage {
    command: string;
    data?: any;
}

export interface SessionManager {
    hasSession(filePath: string): boolean;
    createSession(filePath: string, session: PreviewSession): void;
    getSession(filePath: string): PreviewSession | undefined;
    removeSession(filePath: string): void;
    getAllSessions(): Map<string, PreviewSession>;
    cleanup(): void;
}

export interface CompileResult {
    success: boolean;
    pdfPath?: string;
    error?: string;
    stdout?: string;
    stderr?: string;
}
