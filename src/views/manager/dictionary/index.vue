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
				@update="handleTableUpdate"
				@value="handleTableValue"
				@refresh="handleGet"
			></Table>
			<Form ref="formRef" :data="form" @refresh="handleGet"></Form>
			<Value ref="valueRef"></Value>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { Dictionary, ListDictionaryRequest } from '@/api/manager/dictionary/type';
import { ListDictionary } from '@/api/manager/dictionary/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Value from './components/value.vue';

const valueRef = ref();
const formRef = ref();
const form = ref<Dictionary>({} as Dictionary);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListDictionaryRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '字典名称',
		dataIndex: 'name'
	},
	{
		title: '字典标识',
		dataIndex: 'keyword'
	},
	{
		title: '字典描述',
		dataIndex: 'description'
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
		slotName: 'operations',
		fixed: 'right',
		width: 200
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListDictionary(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListDictionaryRequest) => {
	const { pageSize } = searchForm.value;
	searchForm.value = {
		...req,
		page: 1,
		pageSize
	};

	handleGet();
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.page;
	searchForm.value.pageSize = page.pageSize;
	handleGet();
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as Dictionary;
	formRef.value.showAddDrawer();
};

const handleTableValue = (data: Dictionary) => {
	valueRef.value.show(data.id, data.name);
};

// 处理table点击更新
const handleTableUpdate = async (data: Dictionary) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerDictionary'
};
</script>
