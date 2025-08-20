import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	timeout: 60000, // Had to increase this to 60s lol
});
