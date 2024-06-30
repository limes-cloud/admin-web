import { createApp } from 'vue';
import ArcoVue, { Message } from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import globalComponents from '@/components';
import logo from '@/assets/logo.png';
import router from './router';
import store, { useAppStore } from './store';
import directive from './directive';
import App from './App.vue';
import '@/assets/style/global.less';
import '@/utils/interceptor';
import { formatUrl } from './utils/url';
import { formatTime, parseTime } from './utils/time';
import { densityList, genderList } from './utils/consts';
import { hasPermission } from './utils/permission';
// eslint-disable-next-line import/no-unresolved
import 'virtual:svg-icons-register';
import '@/assets/style/them/gray.less';
import '@/assets/style/animation.less';
import { debounce } from './utils/global';

const app = createApp(App);
if (import.meta.env?.MODE === 'development') {
	app.use(ArcoVue, {});
}
app.use(ArcoVueIcon);
app.use(router);
app.use(store);
app.use(globalComponents);
app.use(directive);

useAppStore()
	.loadSystemSetting()
	.then((res) => {
		app.config.globalProperties.$rurl = formatUrl;
		app.config.globalProperties.$logo = logo;
		app.config.globalProperties.$formatTime = formatTime;
		app.config.globalProperties.$parseTime = parseTime;
		app.config.globalProperties.$densityList = densityList;
		app.config.globalProperties.$genderList = genderList;
		app.config.globalProperties.$hasPermission = hasPermission;
		app.config.globalProperties.$debounce = debounce;
		document.title = res.title;
		if (res.logo) {
			app.config.globalProperties.$logo = res.logo;
		}
		app.mount('#app');
	})
	.catch((data) => {
		Message.error(data.message);
	});
