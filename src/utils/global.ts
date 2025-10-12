import { useAppStore } from '@/store';

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number, immediate = false): (...args: Parameters<T>) => void {
	let timeout: number | null = null;

	// eslint-disable-next-line func-names
	return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
		const later = () => {
			timeout = null;
			if (!immediate) func.apply(this, args);
		};

		const callNow = immediate && !timeout;
		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(later, wait);

		if (callNow) func.apply(this, args);
	};
}

export function pageHeight() {
	const appStore = useAppStore();
	let ph = 60 + 24 + 32;
	if (appStore.footer) {
		ph += 40;
	}
	if (appStore.tabBar) {
		ph += 33;
	}
	return `calc(100vh - ${ph}px)`;
}

export function back() {
	window.history.back();
}

export default null;
