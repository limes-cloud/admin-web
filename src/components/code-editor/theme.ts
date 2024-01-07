import * as monaco from 'monaco-editor';

const customTheme = () => {
	monaco.editor.defineTheme('vs-light', {
		base: 'vs',
		inherit: true,
		rules: [],
		colors: {
			// 相关颜色属性配置
			'editor.foreground': '#000000',
			'editor.background': '#f2f3f5', // 背景色
			'editor.lineHighlightBackground': '#0000FF20'
		}
	});
};

export default customTheme;
