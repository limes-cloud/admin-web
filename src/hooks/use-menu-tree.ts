import { computed } from 'vue';
import { RouteRecordRaw, RouteRecordNormalized } from 'vue-router';
import { useAppStore } from '@/store';
import { cloneDeep } from 'lodash';

export default function useMenuTree() {
	const appStore = useAppStore();
	const appRoute = computed(() => {
		return appStore.appMenu;
	});
	const menuTree = computed<RouteRecordRaw[]>(() => {
		const copyRouter = cloneDeep(appRoute.value) as RouteRecordNormalized[];
		copyRouter.sort((a: RouteRecordNormalized, b: RouteRecordNormalized) => {
			return (a.meta.weight || 0) - (b.meta.weight || 0);
		});
		function travel(_routes: RouteRecordRaw[], layer: number) {
			if (!_routes) return null;

			const collector: any = _routes.map((element) => {
				// leaf node
				if (element.meta?.hideChildrenInMenu || !element.children) {
					element.children = [];
					return element;
				}

				// route filter hideInMenu true
				element.children = element.children.filter((x) => x.meta?.hideInMenu !== true);

				// Associated child node
				const subItem = travel(element.children, layer + 1);

				if (subItem.length) {
					element.children = subItem;
					return element;
				}
				// the else logic
				if (layer > 1) {
					element.children = subItem;
					return element;
				}

				if (element.meta?.hideInMenu === false) {
					return element;
				}

				return null;
			});
			return collector.filter(Boolean);
		}
		return travel(copyRouter, 0);
	});

	return {
		menuTree
	};
}
