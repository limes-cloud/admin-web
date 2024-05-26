import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import svgLoader from 'vite-svg-loader';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import AutoImport from 'unplugin-auto-import/vite';
import jsonEditorPlugin from './plugin/jsonEditor';

export default defineConfig({
	plugins: [
		vue(),
		vueJsx(),
		AutoImport({
			imports: ['vue', 'vue-router'],
			eslintrc: {
				enabled: true
			}
		}),
		svgLoader({ svgoConfig: {} }),
		jsonEditorPlugin(),
		createSvgIconsPlugin({
			// 指定需要缓存的图标文件夹
			iconDirs: [resolve(process.cwd(), 'src/components/svg/source')],
			// 指定symbolId格式
			symbolId: 'icon-[dir]-[name]'
		})
	],
	resolve: {
		alias: [
			{
				find: '@',
				replacement: resolve(__dirname, '../src')
			},
			{
				find: 'assets',
				replacement: resolve(__dirname, '../src/assets')
			},
			{
				find: 'vue-i18n',
				replacement: 'vue-i18n/dist/vue-i18n.cjs.js' // Resolve the i18n warning issue
			},
			{
				find: 'vue',
				replacement: 'vue/dist/vue.esm-bundler.js' // compile template
			}
		],
		extensions: ['.ts', '.js']
	},
	define: {
		'process.env': {}
	},
	css: {
		preprocessorOptions: {
			less: {
				modifyVars: {
					hack: `true; @import (reference) "${resolve('src/assets/style/breakpoint.less')}";`
				},
				javascriptEnabled: true
			}
		}
	}
});
