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
			<Form ref="formRef" :departments="tableData" @refresh="handleGet"></Form>
		</a-card>
		<a-modal
			v-model:visible="showGroup"
			title="部门分类"
			:modal-style="{ width: '80%', maxWidth: '800px' }"
			:body-style="{ padding: 0 }"
			:footer="false"
		>
			<Classify />
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Department, ListDepartmentRequest } from '@/api/manager/department/type';
import { ListCurrentDepartment } from '@/api/manager/department/api';

import Search from './components/search.vue';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';

import Classify from './classify/index.vue';

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const showGroup = ref(false);
const searchForm = ref<ListDepartmentRequest>({});

const columns = ref<TableColumn[]>([
	{
		title: '部门标志',
		dataIndex: 'keyword'
	},
	{
		title: '部门分类',
		dataIndex: 'classify.name'
	},
	{
		title: '部门名称',
		dataIndex: 'name'
	},
	{
		title: '部门描述',
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
		const { data } = await ListCurrentDepartment(searchForm.value);
		tableData.value = data.list;
	} finally {
		setLoading(false);
	}
};

handleGet();

const handleSearch = async (req: ListDepartmentRequest) => {
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
const handleTableUpdate = (data: Department) => {
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
	name: 'ManagerDepartment'
};
</script>
