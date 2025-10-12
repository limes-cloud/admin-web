<template>
	<div class="auto-container" ref="containerRef">
		<slot :width="value.width" :height="value.height"></slot>
	</div>
</template>
<script lang="ts" setup>
import { ref, Ref, watchEffect } from 'vue';

const getWidth = (domRef: Ref<HTMLElement | null>) => {
	const width = ref<number>(0);
	const height = ref<number>(0);
	const observer = new ResizeObserver(() => {
		if (domRef.value) {
			width.value = domRef.value.clientWidth;
			height.value = domRef.value.clientHeight;
		}
	});

	let observerDom: HTMLElement | null = null;
	watchEffect(() => {
		const newDom = domRef.value;
		if (newDom) {
			observerDom = newDom;
			observer.observe(observerDom);
		} else if (observerDom) {
			observer.unobserve(observerDom);
		}
	});

	return { width, height };
};

const containerRef = ref();
const value = ref({ height: ref<number>(), width: ref<number>() });

onMounted(async () => {
	await nextTick();
	const { width, height } = getWidth(containerRef);
	value.value = {
		height,
		width
	};
});

// const containerRef = ref();
// const value = ref({ height: 0, width: 0 });

// onMounted(async () => {
// 	await nextTick();
// 	// 确保容器已经被渲染和挂载
// 	if (containerRef.value) {
// 		// 计算容器的高度
// 		value.value.height = containerRef.value.clientHeight;
// 		value.value.width = containerRef.value.clientWidth;
// 		console.log(value.value);
// 	}
// });
</script>
<style lang="less" scoped>
.auto-container {
	flex-grow: 1; /* 元素B填充剩余空间 */
	min-height: 0; /* 防止溢出 */
}
</style>
