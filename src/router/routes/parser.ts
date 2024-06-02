import type { RouteRecordNormalized } from 'vue-router';
import { Menu } from '@/api/manager/menu/type';
import { DEFAULT_LAYOUT } from './base';
import { App, Component, Home } from '../types';

class Parser {
	// 应用名称集合
	apps: App[] = [];

	// 菜单列表集合
	menus: Map<string, RouteRecordNormalized[]> = new Map();

	// 首页路由
	homes: Map<string, Home> = new Map();

	// 组件
	components: Record<string, () => Promise<unknown>>;

	// 路由
	routers: RouteRecordNormalized[];

	// appi路由
	apiRouters: RouteRecordNormalized[];

	// 指令
	permissions: Map<string, string>;

	// 临时变量homePath
	home?: Home;

	// 初始化构造函数
	constructor(menus: Menu[]) {
		// 加载组件，最大支持5个层级
		this.components = {
			...import.meta.glob(`@/views/*/*.vue`),
			...import.meta.glob(`@/views/*/*/*.vue`),
			...import.meta.glob(`@/views/*/*/*/*.vue`),
			...import.meta.glob(`@/views/*/*/*/*/*.vue`)
		};
		this.routers = [];
		this.permissions = new Map();
		this.apiRouters = [];
		// 循环获取应用路由
		menus.forEach((menu) => {
			// 获取指令/路由/首页
			const routers: RouteRecordNormalized[] = [];
			this.apiRouters = [];
			this.handler([{ ...menu }], routers, false, menu.keyword as string);

			if (routers.length && routers[0].children.length) {
				if (this.home) this.homes.set(menu.keyword as string, { ...this.home });
				this.apps.push(Parser.GetApp(menu));
				this.menus.set(menu.keyword as string, routers[0].children as RouteRecordNormalized[]);
				// 将添加的api追加到children上
				routers[0].children = routers[0].children.concat(this.apiRouters);
				this.routers = this.routers.concat(routers);
			}
		});
	}

	// GetApp 获取App
	private static GetApp = (menu: Menu): App => {
		return {
			keyword: menu.keyword as string,
			title: menu.title,
			icon: menu.icon as string
		};
	};

	// 获取首页路由
	GetHome = () => {
		return this.homes;
	};

	// 获取路由
	GetRouter = () => {
		return this.routers;
	};

	// 获取路由
	GetMenu = () => {
		return this.menus;
	};

	GetApps = () => {
		return this.apps;
	};

	// handler 加载菜单以及指令
	private handler = (menus: Menu[], routers: RouteRecordNormalized[], h: boolean, key: string) => {
		menus.forEach((menu) => {
			let hidden: boolean = h;
			// 处理菜单
			let router: any = null;

			if (menu.path) {
				// 获取首页
				if (menu.isHome) {
					this.home = {
						path: menu.path,
						keyword: menu.keyword as string,
						title: menu.title
					};
				}

				const pm = 'ParentMenu';
				if (!menu.component) {
					menu.component = pm;
				}

				// 加载组件
				let component: Component;
				switch (menu.component) {
					case 'Layout':
						component = DEFAULT_LAYOUT;
						break;
					case pm:
						component = null;
						break;
					default:
						if (!this.components[`/src/views${menu.component}.vue`]) {
							// eslint-disable-next-line no-console
							console.error(`不存在组件：/src/views${menu.component}.vue`);
							return;
						}
						component = () => this.components[`/src/views${menu.component}.vue`]();
				}

				// 判断是否为api挂载的页面
				const apiPage = menu.type === 'A' || menu.type === 'BA';
				// 如果是api则声称随机keyword
				const keyword = menu.keyword ? menu.keyword : Math.random().toString(36);

				const isHidden = (apiPage ? true : !!menu.isHidden) || hidden;
				hidden = isHidden;

				router = {
					path: menu.path,
					name: keyword,
					component,
					redirect: menu.redirect,
					activeMenu: keyword,
					children: [],
					meta: {
						keyword: key,
						title: menu.title,
						icon: `icon-${menu.icon}`,
						hideInMenu: isHidden,
						order: -Number(menu.weight),
						ignoreCache: !menu.isCache,
						noAffix: !menu.isAffix
					}
				};
				if (!apiPage) routers.push(router);
				else this.apiRouters.push(router);
			}

			// 处理指令
			if (menu.permission) {
				this.permissions.set(menu.permission, menu.path as string);
			}

			// 处理子菜单;
			if (menu.children) {
				if (router) {
					this.handler(menu.children, router.children, hidden, key);
				} else {
					this.handler(menu.children, routers, hidden, key);
				}
			}
		});
	};

	// 获取指令
	GetPermission = (): Map<string, string> => {
		return this.permissions;
	};
}

export default Parser;
