import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';

/* Global state for preview sessions */
const activePreviewSessions = new Map<string, vscode.Disposable>();
const statusBarItems = new Map<string, vscode.StatusBarItem>();

// Function to check if LilyPond is installed
function checkLilyPondInstallation(): Promise<boolean> {
	return new Promise((resolve) => {
		cp.exec('lilypond --version', (error) => {
			resolve(!error);
		});
	});
}

function createStatusBarItem(filePath: string): vscode.StatusBarItem {
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

function stopPreviewSession(filePath: string) {
	const session = activePreviewSessions.get(filePath);
	const statusBarItem = statusBarItems.get(filePath);
	
	if (session) {
		session.dispose();
		activePreviewSessions.delete(filePath);
	}
	
	if (statusBarItem) {
		statusBarItem.dispose();
		statusBarItems.delete(filePath);
	}
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

	const previewMenuDisposable = vscode.commands.registerCommand('lytex-preview.previewLytexFile', async (uri: vscode.Uri) => {
		if (!uri) {
			vscode.window.showErrorMessage('No file selected for preview');
			return;
		}

		if (!uri.fsPath.endsWith('.lytex')) {
			vscode.window.showErrorMessage('Please select a .lytex file for preview');
			return;
		}

		const filePath = uri.fsPath;
		const fileKey = filePath;

		// Check if already in preview session
		// TODO: remove the option to start a preveiw session if one is already active
		if (activePreviewSessions.has(fileKey)) {
			vscode.window.showInformationMessage('Preview session already active for this file!');
			return;
		}

		const baseName = path.basename(filePath, '.lytex');
		
		/* Start preview session - watch for saves on this file */
		const saveWatcher = vscode.workspace.onDidSaveTextDocument(async (document) => {
			if (document.uri.fsPath === filePath) {
				vscode.window.showInformationMessage(`Auto-save detected for ${baseName}.lytex`);
				// Session management placeholder - compilation logic removed
			}
		});

		/* Store the session and create status bar item */
		activePreviewSessions.set(fileKey, saveWatcher);
		const statusBarItem = createStatusBarItem(filePath);
		statusBarItems.set(fileKey, statusBarItem);
		
		vscode.window.showInformationMessage(
			`Preview session started for ${baseName}.lytex! Session management active.`
		);
	});
	
	context.subscriptions.push(previewMenuDisposable);

	const compileMenuDisposable = vscode.commands.registerCommand('lytex-preview.compileLytexFile', (uri: vscode.Uri) => {
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

	// Command to stop preview session
	const stopPreviewDisposable = vscode.commands.registerCommand('lytex-preview.stopPreviewSession', () => {
		// Find the active preview session for the current file
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor?.document.uri.fsPath.endsWith('.lytex')) {
			const filePath = activeEditor.document.uri.fsPath;
			stopPreviewSession(filePath);
			vscode.window.showInformationMessage('Preview session stopped.');
		} else {
			// If no active .lytex file, stop all sessions
			const sessionCount = activePreviewSessions.size;
			for (const [filePath] of activePreviewSessions) {
				stopPreviewSession(filePath);
			}
			if (sessionCount > 0) {
				vscode.window.showInformationMessage(`Stopped ${sessionCount} preview session(s).`);
			}
		}
	});

	context.subscriptions.push(stopPreviewDisposable);
	
}

// This method is called when your extension is deactivated
export function deactivate() {
	// Clean up all active preview sessions and status bar items
	for (const [filePath] of activePreviewSessions) {
		stopPreviewSession(filePath);
	}
	activePreviewSessions.clear();
	statusBarItems.clear();
}
