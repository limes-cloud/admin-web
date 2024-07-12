import { App } from 'vue';
import permission from './permission';
import copy from './copy';
import debounce from './debounce';

export default {
	install(Vue: App) {
		Vue.directive('permission', permission);
		Vue.directive('copy', copy);
		Vue.directive('debounce', debounce);
	}
};
