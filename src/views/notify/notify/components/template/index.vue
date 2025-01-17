<template>
	<div class="container" :style="{ padding: 0 }">
		<a-card class="general-card">
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd"></Tool>
			<Table :columns="columns" :loading="loading" :data="tableData" @update="handleTableUpdate" @refresh="handleGet" @send="handleTableSend"></Table>
			<Form ref="formRef" :data="form" @refresh="handleGet"></Form>
			<Send ref="sendRef" :data="form"></Send>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Template } from '@/api/notify/template/type';

import { ListTemplate } from '@/api/notify/template/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Send from './components/send.vue';

const formRef = ref();
const form = ref<Template>({} as Template);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const sendRef = ref();

const props = defineProps<{
	id: number;
}>();

const columns = ref<TableColumn[]>([
	{
		title: '模板渠道',
		slotName: 'channel'
	},
	{
		title: '模板状态',
		slotName: 'status'
	},
	{
		title: '创建时间',
		slotName: 'createdAt',
		width: 170
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations',
		fixed: 'right',
		width: 220
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListTemplate({ notifyId: props.id });
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = { notifyId: props.id } as Template;
	formRef.value.showAddDrawer();
};

const handleTableSend = (data: Template) => {
	sendRef.value.showShowDrawer(data);
};

// 处理table点击更新
const handleTableUpdate = async (data: Template) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};
</script>
