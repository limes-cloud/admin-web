<template>
	<a-modal v-model:visible="visible" unmount-on-close :title="title" fullscreen :footer="false" :body-style="{ padding: '20px 0' }">
		<Value :id="id" :type="tp"></Value>
	</a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Value from './value/index.vue';

const visible = ref(false);
const id = ref(0);
const title = ref('');
const tp = ref('');

const show = (val: number, tit: string, type: string) => {
	id.value = val;
	title.value = `${tit}字典值管理`;
	tp.value = type;
	visible.value = true;
};

const close = () => {
	visible.value = false;
};

defineExpose({ show, close });
</script>
