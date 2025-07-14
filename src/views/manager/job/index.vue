<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd" @classify="handleShowClassify"></Tool>
			<Table
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				@add="handleTableAdd"
				@update="handleTableUpdate"
				@refresh="handleGet"
			></Table>
			<Form ref="formRef" :jobs="tableData" @refresh="handleGet"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Job, ListJobRequest } from '@/api/manager/job/type';
import { ListCurrentJob } from '@/api/manager/job/api';

import Search from './components/search.vue';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const showGroup = ref(false);
const searchForm = ref<ListJobRequest>({});

const columns = ref<TableColumn[]>([
	{
		title: '职位标志',
		dataIndex: 'keyword'
	},
	{
		title: '职位分类',
		dataIndex: 'classify.name'
	},
	{
		title: '职位名称',
		dataIndex: 'name'
	},
	{
		title: '职位描述',
		dataIndex: 'description'
	},
	{
		title: '创建时间',
		slotName: 'createdAt'
	},
	{
		title: '更新时间',
		slotName: 'updatedAt'
	},
	{
		title: '操作',
		slotName: 'operations'
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListCurrentJob(searchForm.value);
		tableData.value = data.list;
	} finally {
		setLoading(false);
	}
};

handleGet();

const handleSearch = async (req: ListJobRequest) => {
	searchForm.value = {
		...searchForm.value,
		...req
	};

	handleGet();
};

//  处理tool按钮新建
const handleToolAdd = () => {
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Job) => {
	formRef.value.showUpdateDrawer(data);
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	formRef.value.showAddDrawer({ parentId: id });
};

const handleShowClassify = () => {
	showGroup.value = true;
};
</script>

<script lang="ts">
export default {
	name: 'ManagerJob'
};
</script>
