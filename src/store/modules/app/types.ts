import { App, Home } from '@/router/types';
import type { RouteRecordNormalized } from 'vue-router';

export interface AppState {
	name: string;
	theme: string;
	colorWeak: boolean;
	navbar: boolean;
	menu: boolean;
	topMenu: boolean;
	hideMenu: boolean;
	menuCollapse: boolean;
	footer: boolean;
	themeColor: string;
	menuWidth: number;
	globalSettings: boolean;
	device: string;
	tabBar: boolean;
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
