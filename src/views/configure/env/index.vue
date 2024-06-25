<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @search="handleSearch"></Search>

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
import { Env, ListEnvRequest } from '@/api/configure/env/type';
import { ListEnv } from '@/api/configure/env/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const formRef = ref();
const form = ref<Env>({} as Env);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');

const searchForm = ref<ListEnvRequest>({});

const columns = ref<TableColumn[]>([
	{
		title: '环境标志',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '环境名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '环境状态',
		dataIndex: 'status',
		slotName: 'status'
	},
	{
		title: '环境描述',
		dataIndex: 'description',
		slotName: 'description'
	},
	{
		title: '创建时间',
		dataIndex: 'created_at',
		slotName: 'createdAt'
	},
	{
		title: '更新时间',
		dataIndex: 'updated_at',
		slotName: 'updatedAt'
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations'
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListEnv();
		tableData.value = data.list;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListEnvRequest) => {
	searchForm.value = { ...req };
	handleGet();
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as Env;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Env) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerEnv'
};
</script>
