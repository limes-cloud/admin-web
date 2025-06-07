<template>
	<a-drawer v-if="appStore.popupType === 'drawer'" :width="getDrawerWidth()"><slot /></a-drawer>
	<a-modal v-else body-class="modal" :width="getModalWidth()"><slot /></a-modal>
</template>

<script lang="ts" setup>
import { useAppStore } from '@/store';

const appStore = useAppStore();

const props = defineProps<{ width?: string | number }>();

const getModalWidth = () => {
	if (!props.width) {
		return 0;
	}
	const widthStr = props.width.toString().replace('px', '');
	return Number(widthStr) + 100;
};

const getDrawerWidth = () => {
	if (!props.width) {
		return 0;
	}
	const widthStr = props.width.toString().replace('px', '');
	return Number(widthStr);
};
</script>

<style lang="less">
.modal {
	max-height: calc(100vh - 200px);
	padding-right: 50px;
	padding-left: 50px;
	overflow-y: scroll;
}
</style>
