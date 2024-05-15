export default function arcoGlobalStyleInjectPlugin() {
	return {
		name: 'style-inject',
		enforce: 'pre',
		transform(code, id) {
			if (id?.includes('main.ts')) {
				return `import '@arco-design/web-vue/dist/arco.css';\n${code}`;
			}
			return code;
		}
	};
}
