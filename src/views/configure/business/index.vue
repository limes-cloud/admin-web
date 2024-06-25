<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @search="handleSearch" @select="handleSearchSelect"></Search>
			<Tool v-model:size="size" v-model:columns="columns" :enable-create="!!searchForm.serverId" @refresh="handleGet" @add="handleToolAdd"></Tool>
			<Table
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				:total="total"
				:pagination="searchForm"
				@page-change="handlePageChange"
				@refresh="handleGet"
				@update="handleTableUpdate"
				@set="handleTableSet"
			></Table>
			<Form ref="formRef" :data="form" :server-id="searchForm.serverId" @refresh="handleGet"></Form>
			<Value ref="valueRef" :type="current.type" :envs="envs"></Value>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { Business, ListBusinessRequest } from '@/api/configure/business/type';
import { Env } from '@/api/configure/env/type';
import { ListEnv } from '@/api/configure/env/api';
import { ListBusiness } from '@/api/configure/business/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Value from './components/value.vue';

const formRef = ref();
const valueRef = ref();
const form = ref<Business>({} as Business);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const envs = ref<Env[]>([]);
const current = ref<Business>({ type: '' } as Business);
const searchForm = ref<ListBusinessRequest>({
	page: 1,
	pageSize: 10,
	serverId: 0
});

const columns = ref<TableColumn[]>([
	{
		title: '变量标识',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '变量类型',
		dataIndex: 'type',
		slotName: 'type'
	},
	{
		title: '变量描述',
		dataIndex: 'description',
		slotName: 'description'
	},
	{
		title: '创建时间',
		dataIndex: 'createdAt',
		slotName: 'createdAt'
	},
	{
		title: '更新时间',
		dataIndex: 'updatedAt',
		slotName: 'updatedAt'
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations'
	}
]);

// handleGetBusinessEnvs 查询所有的环境
const handleGetEnvs = async () => {
	const { data } = await ListEnv({ status: true });
	envs.value = data.list;
};
handleGetEnvs();

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListBusiness(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

// 处理查询
const handleSearch = async (req: ListBusinessRequest) => {
	const { pageSize } = searchForm.value;
	searchForm.value = {
		...req,
		page: 1,
		pageSize
	};
	handleGet();
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as Business;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Business) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// handleTableSet 处理点击值配置
const handleTableSet = (data: Business) => {
	current.value = data;
	valueRef.value.showUpdateDrawer(data.id);
};

const handleSearchSelect = (id: number) => {
	searchForm.value.serverId = id;
	handleGet();
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.page;
	searchForm.value.pageSize = page.pageSize;
	handleGet();
};
</script>

<script lang="ts">
export default {
	name: 'ConfigureBusiness'
};
</script>
