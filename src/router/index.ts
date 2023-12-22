import { createRouter, createWebHistory } from 'vue-router';
import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css';

import createRouteGuard from './guard';
import { LOGIN_ROUTE } from './routes/base';

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const router = createRouter({
	history: createWebHistory(),
	routes: [LOGIN_ROUTE],
	scrollBehavior() {
		return { top: 0 };
	}
});

createRouteGuard(router);

export default router;
