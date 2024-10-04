<template>
	<div class="container" :style="{ padding: 0 }">
		<a-card class="general-card">
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd"></Tool>
			<Table :columns="columns" :loading="loading" :data="tableData" :size="size" @update="handleTableUpdate" @refresh="handleGet"></Table>
			<Form ref="formRef" :data="form" @refresh="handleGet"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { InformationClassify } from '@/api/partyaffairs/information/type';

import { ListInformationClassify } from '@/api/partyaffairs/information/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';

const formRef = ref();
const form = ref<InformationClassify>({} as InformationClassify);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');

const columns = ref<TableColumn[]>([
	{
		title: '分类名称',
		dataIndex: 'name'
	},
	{
		title: '分类权重',
		dataIndex: 'weight'
	},
	{
		title: '创建时间',
		slotName: 'createdAt',
		width: 170
	},
	{
		title: '更新时间',
		slotName: 'updatedAt',
		width: 170
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations',
		fixed: 'right',
		width: 150
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListInformationClassify();
		tableData.value = data.list as unknown as TableData[];
	} finally {
		setLoading(false);
	}
};

handleGet();

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as InformationClassify;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (data: InformationClassify) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};
</script>
