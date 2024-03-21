import { defineStore } from 'pinia';
import { login as userLogin, logout as userLogout } from '@/api/manager/auth';
import { currentUser, switchUserRole } from '@/api/manager/user';
import { setToken, clearToken } from '@/utils/auth';
import { removeRouteListener } from '@/utils/route-listener';
import { LoginReq } from '@/api/manager/types/auth';
import rsa from '@/utils/rsa';
import { User } from '@/api/manager/types/user';
import Message from '@arco-design/web-vue/es/message';
import useAppStore from '../app';

const useUserStore = defineStore('user', {
	state: (): User => ({
		id: 0,
		job_ids: [],
		department_id: 0,
		role_id: 0,
		role_ids: [],
		name: '',
		nickname: '',
		gender: '',
		phone: '',
		avatar: '',
		email: '',
		status: false,
		disabled: '',
		last_login: 0,
		created_at: 0,
		updated_at: 0,
		role: undefined,
		roles: undefined,
		department: undefined
	}),

	getters: {
		userInfo(state: User): User {
			return { ...state };
		}
	},

	actions: {
		async switchRoles(id: number) {
			const { data } = await switchUserRole(id);
			Message.success('切换成功');
			// 清楚数据
			this.clear();
			// 重新设置token
			setToken(data.token);
			// 刷新界面
			window.location.reload();
		},
		// Set user's information
		setInfo(partial: Partial<User>) {
			this.$patch(partial);
		},

		// Reset user's information
		resetInfo() {
			this.$reset();
		},

		// Get user's information
		async info() {
			const { data } = await currentUser();
			this.setInfo(data);
		},

		// Login
		async login(req: LoginReq) {
			const info = {
				...req,
				password: rsa.encrypt({
					password: req.password,
					time: new Date().getTime()
				})
			};
			try {
				const { data } = await userLogin(info as LoginReq);
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
				await userLogout();
			} finally {
				this.clear();
			}
		}
	}
});

export default useUserStore;
