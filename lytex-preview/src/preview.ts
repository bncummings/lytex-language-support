import * as vscode from 'vscode';
import * as path from 'path';
import { sessionManager } from './sessionManager';
import { createWebviewPanel, compileAndDisplayPDF } from './webviewManager';
import { createStatusBarItem } from './statusBarManager';

export const preview = (context: vscode.ExtensionContext) => async (uri: vscode.Uri) => {
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
    if (sessionManager.hasSession(filePath)) {
        vscode.window.showInformationMessage('Preview session already active for this file!');
        return;
    }

    /* Create webview panel */
    const webviewPanel = createWebviewPanel(context, filePath);
    
    /* Start preview session - watch for saves on this file */
    const saveWatcher = vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (document.uri.fsPath === filePath) {
            vscode.window.showInformationMessage(`Auto-save detected for ${baseName}.lytex - recompiling...`);
            
            try {
                await compileAndDisplayPDF(context, filePath);
                vscode.window.showInformationMessage(`Recompiled ${baseName}.lytex successfully!`);
            } catch (error) {
                vscode.window.showErrorMessage(`Recompilation failed: ${error}`);
            }
        }
    });

    /* Store the session and create status bar item */
    const statusBarItem = createStatusBarItem(filePath);
    sessionManager.createSession(filePath, saveWatcher, statusBarItem, webviewPanel);

    /* Initial compilation */
    vscode.window.showInformationMessage(
        `Preview session started for ${baseName}.lytex! Compiling...`
    );

    try {
        await compileAndDisplayPDF(context, filePath);
        vscode.window.showInformationMessage(
            `${baseName}.lytex compiled successfully! Save the file to auto-recompile.`
        );
    } catch (error) {
        vscode.window.showErrorMessage(`Initial compilation failed: ${error}`);
    }
};

export const stopPreview = (context: vscode.ExtensionContext) => () => {
    const activeEditor = vscode.window.activeTextEditor;

    /* Find the active preview session for the current file */
    if (activeEditor?.document.uri.fsPath.endsWith('.lytex')) {
        const filePath = activeEditor.document.uri.fsPath;
        sessionManager.stopSession(filePath);
        vscode.window.showInformationMessage('Preview session stopped.');
    } else {
        /* If no active .lytex file, stop all sessions */
        const sessionCount = sessionManager.getSessionCount();
        const sessionPaths = sessionManager.getAllSessionPaths();
        for (const filePath of sessionPaths) {
            sessionManager.stopSession(filePath);
        }
        if (sessionCount > 0) {
            vscode.window.showInformationMessage(`Stopped ${sessionCount} preview session(s).`);
        }
    }
};

/* Clean up all active preview sessions and status bar items */
export function cleanUpPreviewSessions() {
    sessionManager.cleanup();
};
