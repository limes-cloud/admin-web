<template>
	<div class="content">
		<a-result class="result" status="error" :subtitle="getError()"></a-result>
	</div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const getError = (): string => {
	const text = router.currentRoute.value.query.error;
	if (text) {
		return text as string;
	}
	return '系统错误';
};
</script>

<style scoped lang="less">
.content {
	// padding-top: 100px;
	position: absolute;
	top: 50%;
	left: 50%;
	margin-top: -121px;
	margin-left: -95px;
	text-align: center;
}
</style>
