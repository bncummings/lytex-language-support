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

    // Read the HTML template
    const htmlPath = path.join(context.extensionPath, 'src', 'webview.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Replace placeholder with actual filename
    htmlContent = htmlContent.replace('{{FILENAME}}', baseName + '.lytex');
    webviewPanel.webview.html = htmlContent;

    // Handle webview disposal - stop the preview session when webview is closed
    webviewPanel.onDidDispose(() => {
        sessionManager.markWebviewDisposed(filePath);
        sessionManager.stopSession(filePath);
        vscode.window.showInformationMessage(`Preview session stopped for ${baseName}.lytex (webview closed).`);
    });

    return webviewPanel;
}

export function sendMessageToWebview(filePath: string, message: any): boolean {
    return sessionManager.sendMessageToWebview(filePath, message);
}

export async function compileAndDisplayPDF(context: vscode.ExtensionContext, filePath: string): Promise<void> {
    // Send compiling message to webview
    sendMessageToWebview(filePath, { command: 'compile' });
    
    try {
        const result = await compileLytexFile(context, filePath);
        
        if (result.success && result.pdfPath) {
            console.log('Compilation successful, PDF path:', result.pdfPath);
            
            // Verify PDF file exists
            if (!fs.existsSync(result.pdfPath)) {
                throw new Error(`PDF file not found at: ${result.pdfPath}`);
            }
            
            // Read PDF file and encode as base64
            const pdfBuffer = fs.readFileSync(result.pdfPath);
            const pdfBase64 = pdfBuffer.toString('base64');
            console.log('PDF encoded to base64, size:', pdfBase64.length);
            
            sendMessageToWebview(filePath, { 
                command: 'compiled', 
                pdfData: pdfBase64,
                pdfPath: result.pdfPath
            });
        } else {
            sendMessageToWebview(filePath, { 
                command: 'error', 
                error: result.error || 'Compilation failed for unknown reason' 
            });
            throw new Error(result.error || 'Compilation failed');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        sendMessageToWebview(filePath, { 
            command: 'error', 
            error: `Compilation failed: ${errorMessage}` 
        });
        throw error;
    }
}
