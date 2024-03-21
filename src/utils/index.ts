type TargetContext = '_self' | '_parent' | '_blank' | '_top';

export const openWindow = (url: string, opts?: { target?: TargetContext; [key: string]: any }) => {
	const { target = '_blank', ...others } = opts || {};
	window.open(
		url,
		target,
		Object.entries(others)
			.reduce((preValue: string[], curValue) => {
				const [key, value] = curValue;
				return [...preValue, `${key}=${value}`];
			}, [])
			.join(',')
	);
};

export const regexUrl = new RegExp(
	'^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
	'i'
);

interface Node {
	id: number;
	children: Node[];
}

export const findNode = (root: Node, id: number): Node | null => {
	if (root === null || root.id === id) {
		return root;
	}

	if (root.children) {
		for (let i = 0; i < root.children.length; i += 1) {
			const node = findNode(root.children[i], id);
			if (node !== null) {
				return node;
			}
		}
	}

	return null;
};

export const extractValues = (data: any, path: string) => {
	const result: any[] = [];

	const getValue = (value: any, keys: string[]) => {
		const type = typeof value;
		const copyKeys = [...keys];
		if (copyKeys.length === 0) {
			return;
		}

		if (Array.isArray(value)) {
			value.forEach((val) => {
				if (copyKeys.length >= 1) {
					getValue(val, copyKeys);
				} else {
					result.push(val[copyKeys[0]]);
				}
			});
		} else if (type === 'object') {
			const key = copyKeys.shift() as string;
			const val = value[key];

			if (copyKeys.length >= 1) {
				getValue(val, copyKeys);
			} else {
				result.push(val);
			}
		}
	};
	getValue(data, path.split('.'));
	return result;
};

export default null;
