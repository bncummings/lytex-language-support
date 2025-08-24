import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';

export const compileLytex = (context: vscode.ExtensionContext) => (uri: vscode.Uri) => {
    if (!uri) {
        vscode.window.showErrorMessage('No file selected for compilation');
        return;
    }

    const filePath = uri.fsPath;
    const extensionPath = context.extensionPath;
    const scriptPath = path.join(extensionPath, 'src', 'compile.sh');
    
    console.log('Extension path:', extensionPath);
    console.log('Script path:', scriptPath);
    console.log('File path:', filePath);
    
    /* Execute compile bash script with the file path as an argument */
    cp.exec(`bash "${scriptPath}" "${filePath}"`, { cwd: extensionPath }, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Compilation failed: ${error.message}`);
            console.error('Compilation error:', error);
            return;
        }    

        if (stderr) {
            vscode.window.showWarningMessage(`Compilation warning: ${stderr}`);
            console.warn('Compilation stderr:', stderr);
        }    

        if (stdout) {
            console.log('Compilation stdout:', stdout);
        } 

        vscode.window.showInformationMessage(`Successfully compiled: ${path.basename(filePath)}`);
    });
};
