import { mergeConfig } from 'vite';
import baseConfig from './vite.config.base';
import configCompressPlugin from './plugin/compress';
import configVisualizerPlugin from './plugin/visualizer';
import configArcoResolverPlugin from './plugin/arcoResolver';
import configImageminPlugin from './plugin/imagemin';
import configArcoAutoImportPlugin from './plugin/arcoAutoImport';

export default mergeConfig(
	{
		mode: 'production',
		plugins: [configCompressPlugin('gzip'), configVisualizerPlugin(), configArcoResolverPlugin(), configImageminPlugin(), configArcoAutoImportPlugin()],
		build: {
			rollupOptions: {
				output: {
					manualChunks: {
						arco: ['@arco-design/web-vue'],
						chart: ['echarts', 'vue-echarts'],
						vue: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'vue-i18n']
					}
				}
			},
			chunkSizeWarningLimit: 2000
		}
	},
	baseConfig
);
