import type { RouteLocationNormalized } from 'vue-router';
import { defineStore } from 'pinia';
import { REDIRECT_ROUTE_NAME } from '@/router/constants';
import { isString } from '@/utils/is';
import { TabBarState, TagProps } from './types';

const formatTag = (route: RouteLocationNormalized): TagProps => {
	const { name, meta, fullPath, query } = route;
	return {
		title: meta.title as string,
		name: String(name),
		fullPath,
		query,
		ignoreCache: meta.ignoreCache
	};
};

const BAN_LIST = [REDIRECT_ROUTE_NAME];

const useTabBarStore = defineStore('tabBar', {
	state: (): TabBarState => ({
		cacheTabList: new Set(),
		tagList: [],
		home: <TagProps>{}
	}),

	getters: {
		getTabList(): TagProps[] {
			return this.tagList;
		},
		getCacheList(): string[] {
			return Array.from(this.cacheTabList);
		}
	},

	actions: {
		setHomeTag(tag: TagProps) {
			this.home = tag;
		},
		updateTabList(route: RouteLocationNormalized) {
			if (BAN_LIST.includes(route.name as string)) return;

			const tag = formatTag(route);
			if (!this.tagList.length) {
				this.setHomeTag(tag);
			}

			this.tagList.push(tag);
			if (!route.meta.ignoreCache) {
				this.cacheTabList.add(route.name as string);
			}
		},
		deleteTag(idx: number, tag: TagProps) {
			this.tagList.splice(idx, 1);
			this.cacheTabList.delete(tag.name);
		},
		addCache(name: string) {
			if (isString(name) && name !== '') this.cacheTabList.add(name);
		},
		deleteCache(tag: TagProps) {
			this.cacheTabList.delete(tag.name);
		},
		freshTabList(tags: TagProps[]) {
			this.tagList = tags;
			this.cacheTabList.clear();
			// 要先判断ignoreCache
			this.tagList
				.filter((el) => !el.ignoreCache)
				.map((el) => el.name)
				.forEach((x) => this.cacheTabList.add(x));
		},
		clearTab() {
			this.tagList = [];
			this.cacheTabList.clear();
		},
		resetTab() {
			this.tagList = [this.home];
			this.cacheTabList.clear();
			this.addCache(this.home.name);
		}
	}
});

export default useTabBarStore;
