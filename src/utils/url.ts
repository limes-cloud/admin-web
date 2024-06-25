export const formatUrl = (url: string, w?: number, h?: number) => {
	if (!url) return '';
	let suffix = '';
	if (w && w > 0 && h && h > 0) {
		// local
		suffix = `?width=${w}&height=${h}&mode=fill`;

		// 腾讯云
		if (url.includes('cos')) {
			suffix = `?imageMogr2/crop/${w}x${h}/gravity/center `;
		}

		// 阿里云
		if (url.includes('oss')) {
			suffix = `?x-oss-process=image/resize,m_fill,h_${h},w_${w}`;
		}
	}

	return url + suffix;
};

export const getKeyByUrl = (url: string) => {
	if (!url) return url;
	const arr = url.split('/');
	return arr[arr.length - 1];
};

export const getShaByUrl = (url: string) => {
	if (!url) return url;
	const key = getKeyByUrl(url);
	const arr = key.split('.');
	return arr[0];
};

export default null;
