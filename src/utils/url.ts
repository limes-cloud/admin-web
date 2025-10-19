// export const formatUrl = (url: string, w?: number, h?: number) => {
// 	if (!url) return '';
// 	let suffix = '';
// 	if (w && w > 0 && h && h > 0) {
// 		// local
// 		suffix = `?width=${w}&height=${h}&mode=fill`;

// 		// 腾讯云
// 		if (url.includes('cos')) {
// 			suffix = `?imageMogr2/crop/${w}x${h}/gravity/center `;
// 		}

// 		// 阿里云
// 		if (url.includes('oss')) {
// 			suffix = `?x-oss-process=image/resize,m_fill,h_${h},w_${w}`;
// 		}
// 	}

// 	return url + suffix;
// };

export const rurl = (key: string, w?: number, h?: number) => {
	let url = `${import.meta.env.VITE_API_BASE_URL}/resource/api/${key}`;
	if (!w || !h) {
		return url;
	}

	const suffix = `?width=${w}&height=${h}&mode=fill`;
	return `${url}${suffix}`;
};

export const durl = (key: string, name?: string) => {
	const link = document.createElement('a');
	link.href = `${import.meta.env.VITE_API_BASE_URL}/resource/api/${key}?download=true&save_name=${name}`;
	link.target = '_blank';
	if (name) {
		link.download = name;
	} else {
		const arr = key.split('/');
		link.download = arr[arr.length - 1];
	}
	link.click();
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
