export const formatUrl = (url: string, w?: number, h?: number) => {
	let suffix = '';
	if (w && w > 0 && h && h > 0) {
		// 腾讯云
		if (url.includes('myqcloud.com')) {
			suffix = `?imageMogr2/crop/${w}x${h}/gravity/center `;
		}

		// 阿里云
		if (url.includes('aliyuncs.com')) {
			suffix = `?x-oss-process=image/resize,m_fill,h_${h},w_${w}`;
		}

		// local
		suffix = `?width=${w}&height=${h}&mode=fill`;
	}

	if (url.includes('myqcloud.com') || url.includes('aliyuncs.com')) {
		return url + suffix;
	}
	return `${import.meta.env.VITE_API_BASE_URL}${url}${suffix}`;
};

export default null;
