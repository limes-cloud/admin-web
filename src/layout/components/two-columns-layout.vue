<template>
	<div
		v-if="appStore.device !== 'mobile'"
		:style="{
			paddingTop: appStore.navbar ? '60px' : '',
			width: menuWidth
		}"
		class="layout-sider"
	>
		<div class="parent-memu">
			<App class="menu-item-vertical" />
		</div>
		<Menu class="layout-menu" />
	</div>
</template>

<script setup lang="ts">
import Menu from '@/components/menu/index.vue';
import App from '@/components/navbar/app.vue';
import { useAppStore } from '@/store';
import useMenuTree from '@/hooks/use-menu-tree';

const { menuTree } = useMenuTree();
const appStore = useAppStore();

const menuWidth = computed(() => {
	let width = menuTree.value?.length < 1 ? 100 : appStore.menuWidth;
	if (appStore.menuCollapse) {
		width = 148;
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

	.parent-memu {
		width: 100px;
		height: 100%;
		padding: 4px;

		:deep(.menu-item-vertical .arco-menu-item) {
			flex-direction: column;
			padding-top: 10px;

			.arco-menu-icon {
				margin-right: 0;
				font-size: 20px;
			}

			.arco-menu-title {
				text-align: center;
			}
		}
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

	.layout-menu {
		flex: 1;
		overflow: hidden;
		box-shadow: 0 2px 5px 0 rgb(0 0 0 / 10%);

		:deep(.arco-menu) {
			transition: none;
		}
	}

	:deep(.arco-menu-vertical .arco-menu-inner) {
		padding: 4px;
	}

	:deep(.arco-menu-vertical .arco-menu-item) {
		padding: 0 9px;
		line-height: 36px;
	}
}
</style>
