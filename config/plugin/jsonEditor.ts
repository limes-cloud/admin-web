import viteEditorPlugin from 'vite-plugin-monaco-editor';

export default function monacoEditorPlugin() {
	const plugin = viteEditorPlugin({});
	return plugin;
}
