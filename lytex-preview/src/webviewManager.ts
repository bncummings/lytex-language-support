import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { sessionManager } from './sessionManager';
import { compileLytexFile } from './compile';

export function createWebviewPanel(context: vscode.ExtensionContext, filePath: string): vscode.WebviewPanel {
    const baseName = path.basename(filePath, '.lytex');
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
    const webviewPanel = vscode.window.createWebviewPanel(
        'lytexPreview',
        `Preview: ${baseName}`,
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(context.extensionPath),
                vscode.Uri.file(path.dirname(filePath)),
                ...(workspaceFolder ? [workspaceFolder.uri] : [])
            ]
        }
    );

    /* Load and customize HTML template */
    const htmlContent = loadWebviewHtml(context, baseName);
    webviewPanel.webview.html = htmlContent;
    webviewPanel.onDidDispose(() => {
        sessionManager.markWebviewDisposed(filePath);
        sessionManager.stopSession(filePath);
        vscode.window.showInformationMessage(`Preview session stopped for ${baseName}.lytex (webview closed).`);
    });

    return webviewPanel;
}

export async function compileAndDisplayPDF(context: vscode.ExtensionContext, filePath: string): Promise<void> {
    try {
        sendMessageToWebview(filePath, { command: 'compile' });
        
        const result = await compileLytexFile(context, filePath);
        
        if (result.success && result.pdfPath) {
            await handleSuccessfulCompilation(filePath, result.pdfPath);
        } else {
            handleCompilationError(filePath, result.error || 'Compilation failed for unknown reason');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        handleCompilationError(filePath, `Compilation failed: ${errorMessage}`);

        throw error;
    }
}

export function sendMessageToWebview(filePath: string, message: any): boolean {
    return sessionManager.sendMessageToWebview(filePath, message);
}

function loadWebviewHtml(context: vscode.ExtensionContext, baseName: string): string {
    const htmlPath = path.join(context.extensionPath, 'src', 'webview.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    return htmlContent.replace('{{FILENAME}}', `${baseName}.lytex`);
}

async function handleSuccessfulCompilation(filePath: string, pdfPath: string): Promise<void> {
    console.log('Compilation successful, PDF path:', pdfPath);
    
    /* Verify PDF file exists */
    if (!fs.existsSync(pdfPath)) {
        throw new Error(`PDF file not found at: ${pdfPath}`);
    }
    
    /* Encode PDF as base64 and send to webview */
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfBuffer.toString('base64');
    console.log('PDF encoded to base64, size:', pdfBase64.length);
    
    sendMessageToWebview(filePath, { 
        command: 'compiled', 
        pdfData: pdfBase64,
        pdfPath: pdfPath
    });
}

function handleCompilationError(filePath: string, error: string): void {
    sendMessageToWebview(filePath, { 
        command: 'error', 
        error: error 
    });
}
