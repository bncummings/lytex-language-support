import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});

/**
 * - cannot create two preview sessions for the same file
 * - cannot create two preview sessions fulstop.
 * - can stop a preview session
 * - closing the webview stops the preview session
 * - contents and messages to webview are correct
 * - compilation command works
 * - lilypond and latexmk dependencies are checked properly
 * - status bar item is created and removed correctly
 * - status bar item command works
 * - file watcher works
 * - chmod error doesn't happen
 * - yeah so all the commands and stuff can be run on a sterile machine, and permisions are checked and collected properly
 * - all error messages are shown properly
 */
