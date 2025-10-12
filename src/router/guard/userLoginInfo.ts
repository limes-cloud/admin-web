import type { Router, LocationQueryRaw } from 'vue-router';
import NProgress from 'nprogress'; // progress bar

import { useUserStore } from '@/store';
import { isLogin } from '@/utils/auth';
import { WHITE_LIST } from './permission';

export default function setupUserLoginInfoGuard(router: Router) {
	router.beforeEach(async (to, from, next) => {
		NProgress.start();
		const userStore = useUserStore();
		if (isLogin()) {
			if (to.name === 'login') {
				next({ path: '/' });
				return;
			}
			if (userStore.userInfo.isLogin) {
				next();
			} else {
				try {
					await userStore.info();
					next();
				} catch (error) {
					// await userStore.logout();
					// next({
					// 	name: 'login',
					// 	query: {
					// 		redirect: to.name,
					// 		...to.query
					// 	} as LocationQueryRaw
					// });
				}
			}
		} else {
			if (WHITE_LIST.includes(to.name as string)) {
				next();
				return;
			}

			next({
				name: 'login',
				query: {
					redirect: to.name,
					...to.query
				} as LocationQueryRaw
			});
		}
	});
}
