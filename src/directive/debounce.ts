import { DirectiveBinding } from 'vue';

function debounce<F extends (...args: any[]) => any>(func: F, wait: number, immediate = false): (...args: Parameters<F>) => void {
	let timeoutId: number | null = null;

	return function (this: ThisParameterType<F>, ...args: Parameters<F>): void {
		const later = () => {
			timeoutId = null;
			if (!immediate) func.apply(this, args);
		};

		const shouldCallNow = immediate && timeoutId === null;

		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = window.setTimeout(later, wait);

		if (shouldCallNow) {
			func.apply(this, args);
		}
	};
}

export default {
	mounted(el: HTMLElement, binding: DirectiveBinding) {
		if (typeof binding.value !== 'function') {
			console.warn('v-debounce expects a function as the value');
			return;
		}

		const wait = parseInt(binding.arg || '300', 10);
		const immediate = !!binding.modifiers.immediate;

		// 创建防抖函数
		const debouncedFn = debounce(binding.value, wait, immediate);

		// 添加事件监听器
		el.addEventListener('click', debouncedFn);

		// 在元素上保存 debouncedFn 的引用，以便以后可以移除事件监听器
		(el as any).debouncedFn = debouncedFn;
	},
	beforeUnmount(el: HTMLElement) {
		// 移除事件监听器
		const { debouncedFn } = el as any;
		if (debouncedFn) {
			el.removeEventListener('click', debouncedFn);
		}
		delete (el as any).debouncedFn;
	}
};
