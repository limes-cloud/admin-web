import { App, Home } from '@/router/types';
import type { RouteRecordNormalized } from 'vue-router';

export type LayoutMenu = 'defalut' | 'twoColumns' | 'topMenu';

export interface AppThem {
	theme: string;
	skin: string;
	language: string;
	layout: LayoutMenu;
	animation: string;
	menuWidth: number;
	tabBar: boolean;
	themeColor: string;
}
export interface AppState extends AppThem {
	name: string;
	colorWeak: boolean;
	navbar: boolean;
	menu: boolean;
	hideMenu: boolean;
	menuCollapse: boolean;
	footer: boolean;
	globalSettings: boolean;
	device: string;
	menus: Map<string, RouteRecordNormalized[]>;
	permissions: Map<string, string>;
	apps: App[];
	homes: Map<string, Home>;
	app: string;
	title: string;
	desc: string;
	logo: string;
	isLoading: boolean;
	loadTitle: string;
	[key: string]: unknown;
}
