<template>
	<a-layout class="layout" :class="{ mobile: appStore.hideMenu }">
		<div v-if="navbar" class="layout-navbar">
			<NavBar />
		</div>
		<a-watermark
			:content="watermark"
			:z-index="99999999"
			:font="{
				fontSize: 14
			}"
		>
			<a-layout>
				<a-layout style="flex-direction: row">
					<component :is="view" :key="appStore.layout" />
					<a-drawer v-if="hideMenu" :visible="drawerVisible" placement="left" :footer="false" mask-closable :closable="false" @cancel="drawerCancel">
						<template #header>
							<a-space>
								<img alt="logo" :src="$logo" style="width: 50px; height: 50px" />
								<a-typography-title :style="{ margin: 0, fontSize: '18px', width: '100%' }" :heading="5">
									{{ appStore.currentAppinfo.title }}
								</a-typography-title>
							</a-space>
						</template>
						<Menu />
					</a-drawer>

					<a-layout class="layout-content" :style="paddingStyle">
						<TabBar v-if="appStore.tabBar" />
						<a-layout-content>
							<Content />
						</a-layout-content>
						<Footer v-if="footer" />
					</a-layout>
				</a-layout>
			</a-layout>
		</a-watermark>
	</a-layout>
</template>

<script setup lang="tsx">
import useResponsive from '@/hooks/responsive';
import { useAppStore, useUserStore } from '@/store';
import NavBar from '@/components/navbar/index.vue';
import Menu from '@/components/menu/index.vue';
import Footer from '@/components/footer/index.vue';
import TabBar from '@/components/tab-bar/index.vue';
import Content from './components/content.vue';
import DefaultLayout from './components/default-layout.vue';
import TwoColumnsLayout from './components/two-columns-layout.vue';

const view = shallowRef();
const appStore = useAppStore();
const userStore = useUserStore();

const watermark = computed(() => {
	if (appStore.watermark) {
		return `${appStore.watermark}-${userStore.username}`;
	}
	return '';
});

const drawerVisible = ref(false);
const navbarHeight = `60px`;

const navbar = computed(() => appStore.navbar);
const hideMenu = computed(() => appStore.hideMenu);
const footer = computed(() => appStore.footer);
const paddingStyle = computed(() => {
	const paddingTop = navbar.value ? { paddingTop: navbarHeight } : {};
	return { ...paddingTop };
});

useResponsive(true);

const drawerCancel = () => {
	drawerVisible.value = false;
};

const getView = () => {
	switch (appStore.layout) {
		case 'twoColumns':
			return TwoColumnsLayout;
		case 'topMenu':
			return undefined;
		default:
			return DefaultLayout;
	}
};

watchEffect(() => {
	view.value = getView();
});

provide('toggleDrawerMenu', () => {
	drawerVisible.value = !drawerVisible.value;
});
</script>

<style scoped lang="less">
@nav-size-height: 60px;
@layout-max-width: 1100px;

.layout {
	width: 100%;
	height: 100%;
}

.layout-navbar {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 100;
	width: 100%;
	height: @nav-size-height;
}

.layout-content {
	flex: 1;
	min-height: 100vh;
	overflow: hidden auto;
	background-color: var(--color-fill-2);
	transition: padding 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);
}
</style>
