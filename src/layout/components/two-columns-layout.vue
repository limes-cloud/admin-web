<template>
	<div
		v-if="appStore.device !== 'mobile'"
		:style="{
			paddingTop: appStore.navbar ? '60px' : '',
			width: menuWidth
		}"
		class="layout-sider sider customer-scrollbar"
	>
		<a-menu :selected-keys="selectedKey" class="parent-menu" :show-collapse-button="false">
			<a-menu-item v-for="element in menuTree" :key="element?.name" @click="handleClick(element)">
				<template #icon>
					<component :is="element.meta.icon" v-if="element?.meta?.icon" class="menu-icon" />
				</template>
				{{ element?.meta?.title || '' }}
			</a-menu-item>
		</a-menu>
		<div v-show="subMenus?.length > 0" class="layout-menu">
			<div v-show="!appStore.menuCollapse" class="menu-title">
				<a-typography bold>{{ title }}</a-typography>
				<ADivider :margin="5" />
			</div>
			<Menu v-if="subMenus?.length > 0" :menu="subMenus" />
		</div>
	</div>
</template>

<script setup lang="ts">
import Menu from '@/components/menu/index.vue';
import { useAppStore } from '@/store';
import useMenuTree from '@/hooks/use-menu-tree';
import { openWindow, regexUrl } from '@/utils';
import type { RouteRecordName, RouteRecordRaw } from 'vue-router';

const router = useRouter();
const route = useRoute();
const { menuTree } = useMenuTree();
const appStore = useAppStore();
const subMenus = ref<RouteRecordRaw[]>([]);

const title = ref();
const selectedKey = ref<Array<RouteRecordName>>([]);

function findParent(data: RouteRecordRaw[], target: Partial<RouteRecordName>, result: RouteRecordRaw[]) {
	let isRes = false;
	data?.forEach((item) => {
		if (item.name === target && item?.name) {
			result.splice(0, 1, item);
			isRes = true;
		}
		if (item.children && item.children.length > 0) {
			const isFind = findParent(item.children, target, result);
			if (isFind && item?.name) {
				result.splice(0, 1, item);
				isRes = true;
			}
		}
	});
	return isRes;
}

const handleClick = (item: RouteRecordRaw) => {
	selectedKey.value = [item?.name as string];
	title.value = item?.meta?.title;
	if (regexUrl.test(item.path)) {
		openWindow(item.path);
		return;
	}

	if (item?.children && item?.children?.length > 0) {
		subMenus.value = item?.children;
	} else {
		subMenus.value = [];
		router.push({
			name: item.name
		});
	}
};

watchEffect(() => {
	const subMenuSelectedKey = route?.name;
	const name: RouteRecordRaw[] = [];
	findParent(menuTree.value, subMenuSelectedKey as RouteRecordName, name);
	if (name?.length > 0 && name[0]?.name) {
		selectedKey.value = [name[0]?.name];
		handleClick(name[0]);
	} else {
		subMenus.value = [];
	}
});

const menuWidth = computed(() => {
	let width = subMenus.value?.length < 1 ? 125 : appStore.menuWidth;
	if (appStore.menuCollapse) {
		width = 173;
	}
	return `${width}px`;
});
</script>

<style scoped lang="less">
.layout-sider {
	z-index: 99;
	display: flex;
	background-color: var(--color-menu-light-bg);
	transition: width 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);

	li {
		list-style: none;
	}

	.menu-icon {
		font-size: 18px;
	}

	.parent-menu {
		width: 125px;
		height: 100%;
		border-right: 1px solid var(--color-border);
	}

	.menu-title {
		padding: 10px 0 0 10px;
	}

	&::after {
		position: absolute;
		top: 0;
		right: -1px;
		display: block;
		width: 1px;
		height: 100%;
		background-color: var(--color-border);
		content: '';
	}
}

.parent-menu-container {
	width: 62px;
}

.parent-menu {
	width: 62px;
	height: 57px;
	padding: 5px;
	font-size: 13px;
	cursor: pointer;
	transition: all 0.2s;
	fill: #fff;
}

.parent-menu.active {
	color: #fff;
	background: rgb(var(--primary-6));
}

:deep(.arco-menu-vertical .arco-menu-inner) {
	padding: 4px;
}

:deep(.arco-menu-vertical .arco-menu-item) {
	padding: 0 9px;
	line-height: 36px;
}

.layout-menu {
	display: flex;
	flex: 1;
	flex-direction: column;
	background-color: var(--color-menu-light-bg);
	box-shadow: 0 2px 5px 0 rgb(0 0 0 / 8%);

	:deep(.arco-menu) {
		transition: none;
	}
}
</style>
