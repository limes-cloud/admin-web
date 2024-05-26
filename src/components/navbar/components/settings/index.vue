<template>
	<a-tooltip content="主题设置">
		<element />
	</a-tooltip>
	<a-drawer v-model:visible="visible" ok-text="保存到后台" :width="340" unmount-on-close>
		<a-form :model="form" :auto-label-width="true">
			<template #title>主题设置</template>
			<a-row justify="center">
				<a-col>
					<a-divider orientation="center">个性化设置</a-divider>
					<a-form-item label="系统主色调">
						<a-color-picker v-model="form.themeColor" show-preset show-text :preset-colors="defaultColorList" />
					</a-form-item>
				</a-col>
			</a-row>
			<a-form-item label="当前皮肤">
				<skin v-model="form.skin" />
			</a-form-item>
			<a-form-item label="语言">
				<a-select v-model="form.language">
					<a-option value="zh_CN">简体中文</a-option>
					<a-option value="en">English</a-option>
				</a-select>
			</a-form-item>
			<a-form-item label="开启多标签">
				<a-switch v-model="form.tabBar" />
			</a-form-item>
			<a-form-item label="菜单宽度">
				<a-input-number v-model="form.menuWidth" mode="button" />
			</a-form-item>
			<a-form-item label="菜单布局">
				<a-select v-model="form.layout">
					<a-option value="default">默认</a-option>
					<a-option value="twoColumns">两栏</a-option>
					<a-option value="topMenu">顶栏</a-option>
				</a-select>
			</a-form-item>
			<a-form-item label="切换动画">
				<a-select v-model="form.animation">
					<a-option value="gp-fade">页面渐隐渐出</a-option>
					<a-option value="gp-slide-left">页面向左渐出</a-option>
					<a-option value="gp-slide-right">页面向右渐出</a-option>
					<a-option value="gp-slide-down">页面向下渐出</a-option>
					<a-option value="gp-slide-up">页面向上渐出</a-option>
				</a-select>
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store';
import Skin from '../skin';

const visible = ref(false);
const appStore = useAppStore();
const form = reactive({
	theme: appStore.theme,
	themeColor: appStore.themeColor,
	skin: appStore.skin,
	tabBar: appStore.tabBar,
	menuWidth: appStore.menuWidth,
	layout: appStore.layout,
	language: appStore.language,
	animation: appStore.animation
});
const open = () => {
	visible.value = true;
};
const element = h('span', { onClick: open }, useSlots());
const defaultColorList = [
	'#165DFF',
	'#F53F3F',
	'#F77234',
	'#FF7D00',
	'#F7BA1E',
	'#FADC19',
	'#9FDB1D',
	'#00B42A',
	'#14C9C9',
	'#3491FA',
	'#722ED1',
	'#F5319D',
	'#D91AD9',
	'#34C759',
	'#43a047',
	'#7cb342',
	'#c0ca33',
	'#86909c',
	'#6d4c41'
];

watchEffect(() => {
	window.localStorage.setItem('them', JSON.stringify(form));
	appStore.setThemConfig(form);
});
</script>

<style scoped></style>
