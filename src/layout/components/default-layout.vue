<template>
	<a-layout-sider
		v-if="renderMenu"
		v-show="!hideMenu"
		class="layout-sider"
		breakpoint="xl"
		:collapsed="collapsed"
		:collapsible="true"
		:width="menuWidth"
		:style="{ paddingTop: navbar ? '60px' : '' }"
		:hide-trigger="true"
		@collapse="setCollapsed"
	>
		<div class="menu-wrapper">
			<Menu />
		</div>
	</a-layout-sider>
</template>

<script lang="ts" setup>
import { useAppStore } from '@/store';
import Menu from '@/components/menu/index.vue';

const drawerVisible = ref(false);
const isInit = ref(false);

const appStore = useAppStore();

const navbar = computed(() => appStore.navbar);
const renderMenu = computed(() => appStore.menu);
const hideMenu = computed(() => appStore.hideMenu);
const menuWidth = computed(() => {
	return appStore.menuCollapse ? 48 : appStore.menuWidth;
});
const collapsed = computed(() => {
	return appStore.menuCollapse;
});
const setCollapsed = (val: boolean) => {
	if (!isInit.value) return; // for page initialization menu state problem
	appStore.updateSettings({ menuCollapse: val });
};
provide('toggleDrawerMenu', () => {
	drawerVisible.value = !drawerVisible.value;
});
onMounted(() => {
	isInit.value = true;
});
</script>

<style scoped lang="less">
@nav-size-height: 60px;
@layout-max-width: 1100px;

.layout-sider {
	z-index: 99;
	transition: all 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);

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

	> :deep(.arco-layout-sider-children) {
		overflow-y: hidden;
	}
}

.menu-wrapper {
	height: 100%;
	overflow: auto;
	overflow-x: hidden;

	:deep(.arco-menu) {
		::-webkit-scrollbar {
			width: 12px;
			height: 4px;
		}

		::-webkit-scrollbar-thumb {
			background-color: var(--color-text-4);
			background-clip: padding-box;
			border: 4px solid transparent;
			border-radius: 7px;
		}

		::-webkit-scrollbar-thumb:hover {
			background-color: var(--color-text-3);
		}
	}
}
</style>
