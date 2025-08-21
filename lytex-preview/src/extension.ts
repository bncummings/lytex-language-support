import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';

// Function to check if LilyPond is installed
function checkLilyPondInstallation(): Promise<boolean> {
	return new Promise((resolve) => {
		cp.exec('lilypond --version', (error) => {
			resolve(!error);
		});
	});
}

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "lytex-preview" is now active!');

	// Check if LilyPond is installed
	checkLilyPondInstallation().then((isInstalled) => {
		if (!isInstalled) {
			vscode.window.showWarningMessage(
				'LilyPond is not installed or not in PATH. LyTeX compilation will not work.',
				'Install LilyPond',
				'Dismiss'
			).then((selection) => {
				if (selection === 'Install LilyPond') {
					vscode.env.openExternal(vscode.Uri.parse('https://lilypond.org/'));
				}
			});
		}
	});


	const disposable = vscode.commands.registerCommand('lytex-preview.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World from lytex-preview!');
	});

	context.subscriptions.push(disposable);

	const previewMenuDisposable = vscode.commands.registerCommand('lytex-preview.previewLytexFile', () => {

		vscode.window.showInformationMessage('You did it woohoo!');
	});
	
	context.subscriptions.push(previewMenuDisposable);

	const compileMenuDisposable = vscode.commands.registerCommand('lytex-preview.compileLytexFile', (uri: vscode.Uri) => {
		if (!uri) {
			vscode.window.showErrorMessage('No file selected for compilation');
			return;
		}

		const filePath = uri.fsPath;
		
		// Use the extension's context to find the correct path
		const extensionPath = context.extensionPath;
		const scriptPath = path.join(extensionPath, 'src', 'compile.sh');

		console.log('Extension path:', extensionPath);
		console.log('Script path:', scriptPath);
		console.log('File path:', filePath);

		// Execute the compile script with the file path as an argument
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
	});
	
	context.subscriptions.push(compileMenuDisposable);
	
}

// This method is called when your extension is deactivated
export function deactivate() {}
