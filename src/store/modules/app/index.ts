import defaultSettings from '@/config/settings.json';
import { App, Home } from '@/router/types';
import { generate, getRgbStr } from '@arco-design/color';
import { defineStore } from 'pinia';
import type { RouteRecordNormalized } from 'vue-router';
import { GetSystemSettingReply } from '@/api/manager/system/type';
import { GetSystemSetting } from '@/api/manager/system/api';
import { AppState, AppThem, LayoutMenu } from './types';

// 这里是系统初始化需要加载的全部字典标识集合
const dictKeywords = ['gender'];

const useAppStore = defineStore('app', {
	state: (): AppState => {
		const setting: AppState = {
			...defaultSettings,
			layout: defaultSettings.layout as LayoutMenu,
			menus: new Map(),
			permissions: new Map(),
			apps: [],
			app: '',
			homes: new Map(),
			isLoading: false,
			loadTitle: '',
			name: '',
			changePasswordType: 'password'
		};
		return setting;
	},

	getters: {
		appCurrentSetting(state: AppState): AppState {
			return { ...state };
		},
		appDevice(state: AppState) {
			return state.device;
		},
		appMenu(state: AppState) {
			return state.menus.get(state.app) || [];
		},
		appList(state: AppState) {
			return state.apps || [];
		},
		appPermissions(state: AppState) {
			return state.permissions;
		},
		appHome(state: AppState) {
			return state.homes.get(state.app);
		},
		appHomePath(state: AppState) {
			const home = state.homes.get(state.app);
			if (home) {
				return home.path;
			}

			const menus = state.menus.get(state.app);
			if (menus) {
				return menus[0].path;
			}

			return '';
		},
		currentAppKey(state: AppState) {
			return state.app;
		},
		currentAppinfo(state: AppState) {
			let app = <App>{};
			state.apps.forEach((item) => {
				if (item.keyword === state.app) {
					app = item;
				}
			});
			return app;
		}
	},

	actions: {
		// 加载系统设置
		async loadSystemSetting() {
			const { data } = await GetSystemSetting({ dictionaryKeywords: dictKeywords });
			this.setSetting(data);
			return data;
		},
		// Update app settings
		updateSettings(partial: Partial<AppState>) {
			// @ts-ignore-next-line
			this.$patch(partial);
		},

		// Change theme color
		toggleTheme(dark: boolean) {
			if (dark) {
				this.theme = 'dark';
				document.body.setAttribute('arco-theme', 'dark');
			} else {
				this.theme = 'light';
				document.body.removeAttribute('arco-theme');
			}
		},
		toggleDevice(device: string) {
			this.device = device;
		},
		toggleMenu(value: boolean) {
			this.hideMenu = value;
		},
		clearApp() {
			this.menus = new Map();
			this.permissions = new Map();
			this.apps = [];
			this.app = '';
			this.homes = new Map();
		},
		setApps(apps: App[]) {
			this.apps = apps;
		},
		setMenus(menus: Map<string, RouteRecordNormalized[]>) {
			this.menus = menus;
		},
		setPermissions(ps: Map<string, string>) {
			this.permissions = ps;
		},
		setHomes(homes: Map<string, Home>) {
			this.homes = homes;
		},
		setAppHome(app: string, home: Home) {
			this.homes.set(app, home);
		},
		setCurrentApp(app?: string) {
			this.app = app || this.apps[0].keyword;
		},
		startLoading(title: string) {
			this.isLoading = true;
			this.loadingTitle = title;
		},
		stopLoading() {
			this.isLoading = false;
			this.loadingTitle = '';
		},
		setSetting(setting: GetSystemSettingReply) {
			this.$state = {
				...this.$state,
				...setting,
				footer: !!setting.copyright
			};
			// this.title = setting.title;
			// this.name = setting.name;
			// this.logo = setting.logo;
			// this.desc = setting.desc;
			// this.copyright = setting.copyright;
		},
		setUserSetting(setting?: string) {
			this.userSetting = setting;
		},
		setColor(color: string) {
			if (!/^#[0-9A-Za-z]{6}/.test(color)) return;
			this.themeColor = color;
			const list = generate(this.themeColor, { list: true, dark: this.theme === 'dark' });
			list.forEach((item, index) => {
				const rgbStr = getRgbStr(item);
				document.body.style.setProperty(`--primary-${index + 1}`, rgbStr);
				document.body.style.setProperty(`--arcoblue-${index + 1}`, rgbStr);
			});
			defaultSettings.themeColor = this.themeColor;
		},
		setThemConfig(them: Partial<AppThem>) {
			if (them) {
				Object.keys(them)?.forEach((key) => {
					const value = them[key];
					switch (key) {
						case 'themeColor':
							this.setColor(value);
							break;
						case 'skin':
							this[key] = value;
							document.body.setAttribute('them-skin', this.skin);
							break;
						default:
							this[key] = value;
							break;
					}
				});
			}
		},
		initThemConfig(config?: string) {
			if (config) {
				try {
					const configObj = JSON.parse(config);
					Object.keys(configObj)?.forEach((key) => {
						const value = configObj[key];
						if (key === 'themeColor') {
							this.setColor(value);
						} else {
							this[key] = value;
						}
					});
				} catch (error) {
					// eslint-disable-next-line no-console
					console.warn('用户自定义设置，数据格式异常');
				}
			}
		}
	}
});

export default useAppStore;
