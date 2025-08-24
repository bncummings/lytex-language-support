import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { sessionManager } from './sessionManager';

export function createWebviewPanel(context: vscode.ExtensionContext, filePath: string): vscode.WebviewPanel {
    const baseName = path.basename(filePath, '.lytex');
    
    const webviewPanel = vscode.window.createWebviewPanel(
        'lytexPreview',
        `Preview: ${baseName}`,
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(context.extensionPath)]
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
