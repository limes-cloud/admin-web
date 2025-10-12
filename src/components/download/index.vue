<template>
	<div class="download">
		<a-modal
			v-model:visible="visible"
			unmount-on-close
			hide-title
			:footer="false"
			width="400px"
			:body-style="{ position: 'relative' }"
			@ok="handleOk"
			@cancel="handleCancel"
		>
			<span class="close" @click="handleCancel"><icon-close-circle :size="18" /></span>

			<template v-if="status === 'processing'">
				<a-result title="进行中" subtitle="资源正在导出中，请耐心等待~">
					<template #icon><icon-loading /></template>
				</a-result>
				<a-alert>你也可以直接关闭等待窗口，后续到“资源中心>导出管理”中进行查看导出结果</a-alert>
			</template>
			<template v-if="status === 'error'">
				<a-result title="导出失败" :subtitle="result" status="error"></a-result>
			</template>
			<template v-if="status === 'expired'">
				<a-result title="已过期" subtitle="资源已过期，请进行重新导出～" status="error"></a-result>
			</template>
			<template v-if="status === 'complete'">
				<a-result title="导出成功" status="success">
					<template #subtitle>
						资源导出成功，点击
						<span class="download-text" @click="handleDownloadFile(downloadData.src, downloadData.name)">
							<icon-download />
							立即下载
						</span>
					</template>
				</a-result>
				<a-alert>你也可以直接关闭下载窗口，后续到“资源中心>导出管理”中进行查看并下载</a-alert>
			</template>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { GetExport } from '@/api/resource/export/api';

const props = defineProps<{ id: number; modelValue: boolean }>();
const emit = defineEmits(['fail', 'complete', 'expired', 'error', 'processing', 'update:modelValue']);
const status = ref('processing');
const visible = ref(false);
const result = ref('');
const timeout = ref();
const downloadData = ref({ src: '', name: '' });

const fetch = () => {
	timeout.value = setInterval(async () => {
		try {
			const { data } = await GetExport({ id: props.id });
			if (data.status === 'COMPLETED') {
				emit('complete');
				status.value = 'complete';
				clearInterval(timeout.value);
				downloadData.value = { src: data.url as string, name: data.name };
			} else if (data.status === 'FAIL') {
				emit('fail');
				status.value = 'fail';
				clearInterval(timeout.value);
			} else if (data.status === 'EXPIRED') {
				emit('expired');
				status.value = 'expired';
				clearInterval(timeout.value);
			} else {
				emit('processing');
				status.value = 'processing';
			}
		} catch (e) {
			const { message } = e as any;
			clearInterval(timeout.value);
			status.value = 'error';
			result.value = message as string;
			emit('error');
		}
	}, 2000);
};

watch(
	() => props.modelValue,
	() => {
		if (visible.value === props.modelValue) {
			return;
		}
		visible.value = props.modelValue;
		if (visible.value) {
			fetch();
		}
	},
	{ immediate: true }
);

const handleCancel = () => {
	clearInterval(timeout.value);
	emit('update:modelValue', false);
};

const handleOk = () => {
	clearInterval(timeout.value);
};

onUnmounted(() => {
	clearInterval(timeout.value);
});

const handleDownloadFile = (src: string, name: string) => {
	const link = document.createElement('a');
	link.href = `${src}?download=true&save_name=${name}`;
	link.target = '_blank';
	link.download = src.substring(src.lastIndexOf('/'));
	link.click();

	handleCancel();
};
</script>

<style lang="less" scoped>
.close {
	position: absolute;
	top: 10px;
	right: 10px;
	cursor: pointer;
}

.download-text {
	color: rgb(var(--arcoblue-6));
	cursor: pointer;
}
</style>
