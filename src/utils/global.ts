export function debounce<T extends (...args: any[]) => void>(func: T, wait: number, immediate = false): (...args: Parameters<T>) => void {
	let timeout: number | null = null;

	return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
		const later = () => {
			timeout = null;
			if (!immediate) func.apply(this, args);
		};

		const callNow = immediate && !timeout;
		console.log(callNow);
		if (timeout) {
			console.log('clear');
			clearTimeout(timeout);
		}
		console.log(timeout);

		timeout = setTimeout(later, wait);

		if (callNow) func.apply(this, args);
	};
}

export default null;
