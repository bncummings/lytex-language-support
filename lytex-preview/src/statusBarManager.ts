import * as vscode from 'vscode';
import * as path from 'path';

export function createStatusBarItem(filePath: string): vscode.StatusBarItem {
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
