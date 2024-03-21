<template>
	<a-modal v-model:visible="visible" unmount-on-close title="对象资源值" :body-style="{ padding: 0 }">
		<a-table :columns="columns" :data="data" :bordered="false" :pagination="false"></a-table>
	</a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';

const visible = ref(false);
const data = ref<TableData[]>([]);

const show = (val) => {
	visible.value = true;
	data.value = val;
};

const hide = () => {
	visible.value = false;
};

defineExpose({ show, hide });

const columns = [
	{
		title: '标签',
		dataIndex: 'label'
	},
	{
		title: '值',
		dataIndex: 'value'
	}
];
</script>
