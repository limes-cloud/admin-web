<template>
	<a-modal v-model:visible="visible" fullscreen hide-title :footer="false" :body-style="{ padding: 0 }">
		<Code v-bind="$attrs" :style="{ width: '100%', height: '100vh' }" :is-fullscreen="visible" @change-fullscreen="toggleFullScreen"></Code>
	</a-modal>
	<Code v-bind="$attrs" :is-fullscreen="visible" @change-fullscreen="toggleFullScreen"></Code>
</template>

<script lang="ts" setup>
import Code from './code.vue';

const visible = ref(false);
const toggle = ref(true);
const toggleFullScreen = (val: boolean) => {
	if (!toggle.value) {
		return;
	}
	toggle.value = false;
	visible.value = val;
	setTimeout(() => {
		toggle.value = true;
	}, 10);
};
</script>

<style lang="less" scoped></style>
