import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message, Modal } from '@arco-design/web-vue';
import { useUserStore } from '@/store';
import { getToken, isLogin, setToken } from '@/utils/auth';
import { refreshToken } from '@/api/manager/auth';

export interface HttpResponse<T = unknown> {
	code: number;
	message: string;
	reason: string;
	data: T;
}

if (import.meta.env.VITE_API_BASE_URL) {
	axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
	axios.defaults.withCredentials = false;
	axios.defaults.timeout = 10000;
}

axios.interceptors.request.use(
	(config: AxiosRequestConfig) => {
		if (isLogin()) {
			const token = getToken();
			if (!config.headers) {
				config.headers = {};
			}
			config.headers.Authorization = `Bearer ${token}`;
		}
		if (!config.headers) {
			config.headers = {};
		}
		if (config.url === '/resource/v1/upload') {
			config.timeout = 60000;
		}
		config.headers['Content-Type'] = 'application/json';
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// 是否正在刷新的标记
let isRefresh = false;
// 重试队列，每一项将是一个待执行的函数形式
let requests: any = [];

axios.interceptors.response.use(
	(response: AxiosResponse<HttpResponse>) => {
		const res = response.data;

		if (res.code === 200 && res.reason === 'SUCCESS') {
			return res;
		}

		// 通用错误处理逻辑
		Message.error({
			content: res.message || 'Error',
			duration: 5 * 1000
		});
		return Promise.reject(new Error(res.message || 'Error'));
	},
	(error) => {
		const res = error.response;
		const { config } = res;

		// 重新登陆过期处理
		if (res.status === 401 && res.data.reason === 'UNAUTHORIZED') {
			if (!isRefresh) {
				isRefresh = true;
				return refreshToken()
					.then((resToken) => {
						// 处理刷新成功
						setToken(resToken.data.token);
						requests.forEach((cb: any) => cb(resToken.data.token));
						requests = [];
						return axios(config);
					})
					.catch(() => {
						Modal.error({
							title: '登录状态已失效，请重新登录',
							content: res.message,
							okText: '重新登陆',
							onOk() {
								// 清空数据
								useUserStore().clear();
								window.location.reload();
							}
						});
						return Promise.reject(error);
					})
					.finally(() => {
						isRefresh = false;
					});
			}

			return new Promise((resolve) => {
				requests.push(() => {
					resolve(axios(config));
				});
			});
		}

		if (res.status !== 401) {
			Message.error({
				content: res.data.message || 'Request Error',
				duration: 5 * 1000
			});
		}
		return Promise.reject(res.data);
	}
);
