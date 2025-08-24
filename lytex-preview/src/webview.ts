import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function createWebviewPanel(context: vscode.ExtensionContext, filePath: string): vscode.WebviewPanel {
    const baseName = path.basename(filePath, '.lytex');
    
    const panel = vscode.window.createWebviewPanel(
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
    
    panel.webview.html = htmlContent;
    
    return panel;
}