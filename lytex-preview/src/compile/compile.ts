import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { CompileResult } from '../types';

/**
 * Compiles a LyTeX file to PDF using the compile.sh script.
 * 
 * @param {vscode.ExtensionContext} context VS Code extension context
 * @param {string} filePath Path to the .lytex file
 * @returns {Promise<CompileResult>} Promise resolving to compilation result with success status, PDF path, and output
 */
export async function compileLytexFile(context: vscode.ExtensionContext, filePath: string): Promise<CompileResult> {
    const baseName = path.basename(filePath, '.lytex');
    const pdfPath = path.join(path.dirname(filePath), `${baseName}.pdf`);
    const scriptPath = path.join(context.extensionPath, 'src', 'compile', 'compile.sh');
    
    console.log('Extension path:', context.extensionPath);
    console.log('Script path:', scriptPath);
    console.log('File path:', filePath);
    
    return new Promise<CompileResult>((resolve) => {
        cp.exec(`bash "${scriptPath}" "${filePath}"`, { cwd: context.extensionPath }, (error, stdout, stderr) => {
            if (error) {
                console.error('Compilation error:', error);
                resolve({
                    success: false,
                    error: error.message,
                    stdout,
                    stderr
                });
                return;
            }
            
            if (stderr) {
                console.warn('Compilation stderr:', stderr);
            }
            
            if (stdout) {
                console.log('Compilation stdout:', stdout);
            }
            
            /* check if pdf was created successfully */
            if (fs.existsSync(pdfPath)) {
                resolve({
                    success: true,
                    pdfPath,
                    stdout,
                    stderr
                });
            } else {
                resolve({
                    success: false,
                    error: 'PDF file was not created after compilation',
                    stdout,
                    stderr
                });
            }
        });
    });
}

/**
 * VS Code command handler for compiling LyTeX files with user feedback.
 * 
 * @param {vscode.ExtensionContext} context - VS Code extension context
 * @returns {(uri: vscode.Uri) => Promise<void>} Command handler function
 */
export const compileLytex = (context: vscode.ExtensionContext) => async (uri: vscode.Uri) => {
    if (!uri) {
        vscode.window.showErrorMessage('No file selected for compilation');
        return;
    }

    const filePath = uri.fsPath;
    const baseName = path.basename(filePath, '.lytex');
    
    try {
        const result = await compileLytexFile(context, filePath);
        
        if (result.success) {
            vscode.window.showInformationMessage(`Successfully compiled: ${baseName}.lytex`);
        } else {
            vscode.window.showErrorMessage(`Compilation failed: ${result.error}`);
            if (result.stderr) {
                vscode.window.showWarningMessage(`Compilation warning: ${result.stderr}`);
            }
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Compilation failed: ${error}`);
    }
};
