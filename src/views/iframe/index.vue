<template>
	<div class="container">
		<Breadcrumb />
		<a-card
			class="general-card"
			:style="{
				height: 'calc(100vh - ' + pageOhterHeight + 'px' + ')'
			}"
			:body-style="{ height: '100%' }"
		>
			<div
				v-if="iframeUrl.length"
				:style="{
					width: '100%',
					height: '100%'
				}"
			>
				<iframe class="iframe" :src="iframeUrl" height="100%"></iframe>
			</div>
		</a-card>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import useAppStore from '@/store/modules/app';

const appStore = useAppStore();
const pageOhterHeight = ref(56 + 58 + 20);
if (appStore.footer) {
	pageOhterHeight.value += 40;
}
if (appStore.tabBar) {
	pageOhterHeight.value += 32;
}
const router = useRoute();
// 去除params 前缀?url=xxx
const { url } = router.meta.params;
const iframeUrl = ref(''); // 将此URL更换为你想要加载的页面
iframeUrl.value = url;
</script>

<style scoped>
.general-card {
	position: relative;
	width: 100%;
	height: 500px;
}

.iframe {
	width: 100%;
	height: 100%;
	border: none;
}

/* 在这里添加一些样式，如果你需要的话 */
</style>
