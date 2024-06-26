import { defineStore } from 'pinia';
import { setToken, clearToken } from '@/utils/auth';
import { removeRouteListener } from '@/utils/route-listener';
import rsa from '@/utils/rsa';
import Message from '@arco-design/web-vue/es/message';
import { UserLogin, UserLogout, GetCurrentUser } from '@/api/manager/user/api';
import { UpdateCurrentUserRoleRequest, GetUserReply, UserLoginRequest } from '@/api/manager/user/type';

import useAppStore from '../app';

const useUserStore = defineStore('user', {
	state: (): GetUserReply => ({
		id: 0,
		departmentId: 0,
		roleId: 0,
		name: '',
		nickname: '',
		gender: '',
		phone: '',
		avatar: '',
		email: '',
		status: false,
		loggedAt: 0,
		createdAt: 0,
		updatedAt: 0,
		role: undefined,
		roles: [],
		jobs: [],
		department: undefined
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

		// Get user's information
		async info() {
			const data = await GetCurrentUser();
			const appStore = useAppStore();
			appStore.initThemConfig(data.setting);
			this.setInfo(data);
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
