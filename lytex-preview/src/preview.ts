import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { createWebviewPanel } from './webview';

/* Global state for preview sessions */
const activePreviewSessions = new Map<string, vscode.Disposable>();
const statusBarItems = new Map<string, vscode.StatusBarItem>();
const activeWebviews = new Map<string, vscode.WebviewPanel>();


export const preview = (context: vscode.ExtensionContext) =>  async (uri: vscode.Uri) => {
    if (!uri) {
        vscode.window.showErrorMessage('No file selected for preview');
        return;
    }

    if (!uri.fsPath.endsWith('.lytex')) {
        vscode.window.showErrorMessage('Please select a .lytex file for preview');
        return;
    }

    const filePath = uri.fsPath;
    const baseName = path.basename(filePath, '.lytex');
    
    /* Check if already in preview session */
    if (activePreviewSessions.has(filePath)) {
        vscode.window.showInformationMessage('Preview session already active for this file!');
        return;
    }

    /* Create webview panel */
    const webviewPanel = createWebviewPanel(context, filePath);
    activeWebviews.set(filePath, webviewPanel);
    
    /* Start preview session - watch for saves on this file */
    const saveWatcher = vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (document.uri.fsPath === filePath) {
            vscode.window.showInformationMessage(`Auto-save detected for ${baseName}.lytex`);
            // TODO: Compilation on save

            /* Send compile message to webview */
            const webview = activeWebviews.get(filePath);
            if (webview) {
                webview.webview.postMessage({ command: 'compile' });
            }
        
        }
    });

    /* Store the session and create status bar item */
    activePreviewSessions.set(filePath, saveWatcher);
    const statusBarItem = createStatusBarItem(filePath);
    statusBarItems.set(filePath, statusBarItem); 
          
    vscode.window.showInformationMessage(
        `Preview session started for ${baseName}.lytex! Webview opened side by side.`
    );
};

function createStatusBarItem(filePath: string): vscode.StatusBarItem {
    const baseName = path.basename(filePath, '.lytex');
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);

    statusBarItem.text = `$(stop-circle) ${baseName} Preview`;
    statusBarItem.tooltip = `Click to stop preview session for ${baseName}.lytex`;
    statusBarItem.command = 'lytex-preview.stopPreviewSession';
    statusBarItem.color = '#ff6b6b'; // Red color
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    statusBarItem.show();

    return statusBarItem;
}

export function sendMessageToWebview(filePath: string, message: any) {
    const webview = activeWebviews.get(filePath);
    if (webview) {
        webview.webview.postMessage(message);
        return true;
    }
    return false;
}

export const stopPreview = (context: vscode.ExtensionContext) => () => {
    const activeEditor = vscode.window.activeTextEditor;

    /* Find the active preview session for the current file */
    if (activeEditor?.document.uri.fsPath.endsWith('.lytex')) {
        const filePath = activeEditor.document.uri.fsPath;
        stopPreviewSession(filePath);
        vscode.window.showInformationMessage('Preview session stopped.');
    } else {
        /* If no active .lytex file, stop all sessions */
        const sessionCount = activePreviewSessions.size;
        for (const [filePath] of activePreviewSessions) {
            stopPreviewSession(filePath);
        }
        if (sessionCount > 0) {
            vscode.window.showInformationMessage(`Stopped ${sessionCount} preview session(s).`);
        }
    }
};

function stopPreviewSession(filePath: string) {
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
        activeWebviews.delete(filePath);
    }
}

/* Clean up all active preview sessions and status bar items */
export function cleanUpPreviewSessions() {
    for (const [filePath] of activePreviewSessions) {
        stopPreviewSession(filePath);
    }
    
    activePreviewSessions.clear();
    statusBarItems.clear();
    activeWebviews.clear();
};
