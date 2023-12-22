import { App } from 'vue';
import permission from './permission';
import copy from './copy';

export default {
	install(Vue: App) {
		Vue.directive('permission', permission);
		Vue.directive('copy', copy);
	}
};
