/**
 * 验证手机格式
 */
function mobile(value) {
	const mobileRegex = /^1[3-9]\d{9}$/;
	return mobileRegex.test(value);
}

export default {
	mobile
};
