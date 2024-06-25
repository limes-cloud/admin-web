<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd"></Tool>
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
			<Form ref="formRef" @refresh="handleGet"></Form>
			<Value ref="valueRef" :envs="envs"></Value>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { Resource, ListResourceRequest } from '@/api/configure/resource/type';
import { Env } from '@/api/configure/env/type';
import { ListEnv } from '@/api/configure/env/api';
import { ListResource } from '@/api/configure/resource/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Value from './components/value.vue';

const formRef = ref();
const valueRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const envs = ref<Env[]>([]);
const searchForm = ref<ListResourceRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '变量标识',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '变量字段',
		dataIndex: 'fields',
		slotName: 'fields'
	},
	{
		title: '变量标签',
		dataIndex: 'tag',
		slotName: 'tag'
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

// handleGetResourceEnvs 查询所有的环境
const handleGetEnvs = async () => {
	const { data } = await ListEnv({ status: true });
	envs.value = data.list;
};
handleGetEnvs();

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListResource(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};
handleGet();

// 处理查询
const handleSearch = async (req: ListResourceRequest) => {
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
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Resource) => {
	formRef.value.showUpdateDrawer(data.id);
};

// handleTableSet 处理点击值配置
const handleTableSet = (data: Resource) => {
	valueRef.value.showUpdateDrawer(data.id);
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
	name: 'ConfigureResource'
};
</script>
