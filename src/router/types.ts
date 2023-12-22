import { defineComponent } from 'vue';
import type { NavigationGuard, RouteMeta as VueRouteMeta } from 'vue-router';
import 'vue-router';

export type Component<T = any> = ReturnType<typeof defineComponent> | (() => Promise<typeof import('*.vue')>) | (() => Promise<T>);

declare module 'vue-router' {
	interface RouteMeta {
		app?: string;
		icon?: string; // The icon show in the side menu
		title?: string;
		locale?: string; // The locale name show in side menu and breadcrumb
		hideInMenu?: boolean; // If true, it is not displayed in the side menu
		hideChildrenInMenu?: boolean; // if set true, the children are not displayed in the side menu
		activeMenu?: string; // if set name, the menu will be highlighted according to the name you set
		weight?: number; // Sort routing menu items. If set key, the higher the value, the more forward it is
		noAffix?: boolean; // if set true, the tag will not affix in the tab-bar
		ignoreCache?: boolean; // if set true, the page will not be cached
	}
}

export interface AppRouteRecordRaw {
	path: string;
	name?: string | symbol;
	app: string;
	meta?: VueRouteMeta;
	redirect?: string;
	component: Component | string;
	children?: AppRouteRecordRaw[];
	alias?: string | string[];
	props?: Record<string, any>;
	beforeEnter?: NavigationGuard | NavigationGuard[];
	fullPath?: string;
}

export interface App {
	title: string;
	icon: string;
	keyword: string;
}

export interface Home {
	path: string;
	keyword: string;
	title: string;
}
