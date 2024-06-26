import { DirectiveBinding } from 'vue';

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {}

export default {
	mounted(el: HTMLElement, binding: DirectiveBinding) {
		checkPermission(el, binding);
	},
	updated(el: HTMLElement, binding: DirectiveBinding) {
		checkPermission(el, binding);
	}
};
