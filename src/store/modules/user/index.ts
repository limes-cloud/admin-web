import { defineStore } from 'pinia';
import { setToken, clearToken } from '@/utils/auth';
import { removeRouteListener } from '@/utils/route-listener';
import rsa from '@/utils/rsa';
import Message from '@arco-design/web-vue/es/message';
import { UserLogin, UserLogout, GetCurrentUser, UpdateCurrentUserSetting } from '@/api/manager/user/api';
import { UpdateCurrentUserRoleRequest, GetUserReply, UserLoginRequest } from '@/api/manager/user/type';

import { OAuthBindRequest } from '@/api/manager/auth/type';
import { OAuthBind } from '@/api/manager/auth/api';
import useAppStore from '../app';

const useUserStore = defineStore('user', {
	state: (): GetUserReply => ({
		isLogin: false,
		id: 0,
		deptId: 0,
		jobId: 0,
		username: '',
		nickname: '',
		avatar: '',
		status: false,
		loggedAt: 0,
		setting: '',
		createdAt: 0,
		updatedAt: 0,
		infos: [],
		job: undefined,
		dept: undefined
	}),

	getters: {
		userInfo(state: GetUserReply): GetUserReply {
			return { ...state };
		}
	},

	actions: {
		// Set user's information
		setInfo(partial: Partial<GetUserReply>) {
			this.$patch(partial);
		},

		// Reset user's information
		resetInfo() {
			this.$reset();
		},

		// Reset user's information
		updateSetting(setting: Record<string, any>) {
			let currentSetting = {};
			if (this.setting) {
				try {
					currentSetting = JSON.parse(this.setting);
				} catch (error) {
					// ingore
				}
			}
			const data = {
				...currentSetting,
				...setting
			};

			const app = useAppStore();

			UpdateCurrentUserSetting({ app: app.keyword, setting: JSON.stringify(data) }).then(() => {
				Message.success('保存成功');
			});
		},

		// Get user's information
		async info() {
			const app = useAppStore();
			const { data } = await GetCurrentUser({ app: app.keyword });
			const appStore = useAppStore();
			appStore.initThemConfig(data.setting);
			this.setInfo(data);
		},
		setToken(token) {
			setToken(token);
			this.isLogin = true;
		},
		// Login
		async login(req: UserLoginRequest) {
			const info = {
				...req,
				password: rsa.encrypt({
					password: req.password,
					time: new Date().getTime()
				})
			};
			try {
				const { data } = await UserLogin(info as UserLoginRequest);
				setToken(data.token);
			} catch (err) {
				clearToken();
				throw err;
			}
		},
		// Login
		async oauthBind(req: OAuthBindRequest) {
			const info = {
				...req,
				password: rsa.encrypt({
					password: req.password,
					time: new Date().getTime()
				})
			};
			try {
				const { data } = await OAuthBind(info as OAuthBindRequest);
				setToken(data.token);
			} catch (err) {
				clearToken();
				throw err;
			}
		},
		clear() {
			const appStore = useAppStore();
			this.resetInfo();
			clearToken();
			removeRouteListener();
			appStore.clearApp();
		},
		// Logout
		async logout() {
			try {
				await UserLogout();
			} finally {
				this.clear();
			}
		}
	}
});

export default useUserStore;
