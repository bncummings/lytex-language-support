import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Creates a status bar item for a LyTeX file preview session.
 * 
 * @param {string} filePath - The absolute path to the LyTeX file
 * @returns {vscode.StatusBarItem} A configured status bar item for stopping the preview session
 */
export function createStatusBarItem(filePath: string): vscode.StatusBarItem {
    const baseName = path.basename(filePath, '.lytex');
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);

    statusBarItem.text = `$(stop-circle) Preview: ${baseName}`;
    statusBarItem.tooltip = `Click to stop preview session for ${baseName}.lytex`;
    statusBarItem.command = 'lytex-preview.stopPreviewSession';
    statusBarItem.color = '#ff6b6b'; // Red
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    statusBarItem.show();

    return statusBarItem;
}
