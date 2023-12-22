import { DirectiveBinding } from 'vue';
import { useAppStore } from '@/store';
import router from '@/router';

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
	const { value } = binding;
	const appStore = useAppStore();
	const { permissions } = appStore;

	if (typeof value === 'string') {
		if (value.length > 0) {
			const hasPermission = permissions.has(value);
			if (!hasPermission && el.parentNode) {
				el.parentNode.removeChild(el);
			} else if (permissions.get(value)) {
				// 绑定指令跳转
				el.onclick = () => {
					router.push({ path: permissions.get(value) as string });
				};
			}
		}
	} else {
		throw new Error(`need roles! Like v-permission="'permission'"`);
	}
}

export default {
	mounted(el: HTMLElement, binding: DirectiveBinding) {
		checkPermission(el, binding);
	},
	updated(el: HTMLElement, binding: DirectiveBinding) {
		checkPermission(el, binding);
	}
};
