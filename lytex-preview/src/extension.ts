import * as vscode from 'vscode';
import * as cp from 'child_process';
import { compileLytex } from './compile/compile';
import { preview, stopPreview, cleanUpPreviewSessions } from './preview/preview';

/* Function to check if LilyPond is installed */
function checkLilyPondInstallation(): Promise<boolean> {
	return new Promise((resolve) => {
		cp.exec('lilypond --version', (error) => {
			resolve(!error);
		});
	});
}

/* Handles activation house keeping */
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "lytex-preview" is now active!');

	/* Check if LilyPond is installed */
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

	const previewMenuDisposable = vscode.commands.registerCommand('lytex-preview.previewLytexFile', preview(context));
	const compileMenuDisposable = vscode.commands.registerCommand('lytex-preview.compileLytexFile', compileLytex(context));
	const stopPreviewDisposable = vscode.commands.registerCommand('lytex-preview.stopPreviewSession', stopPreview(context));

	context.subscriptions.push(previewMenuDisposable);
	context.subscriptions.push(compileMenuDisposable);
	context.subscriptions.push(stopPreviewDisposable);
}

/* This method is called when your extension is deactivated */
export function deactivate() {
	cleanUpPreviewSessions();
}
