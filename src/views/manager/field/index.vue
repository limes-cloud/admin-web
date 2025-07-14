<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd"></Tool>
			<Table
				:types="types"
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				:total="total"
				:pagination="searchForm"
				@page-change="handlePageChange"
				@update="handleTableUpdate"
				@refresh="handleGet"
			></Table>
			<Form ref="formRef" :data="form" :types="types" @refresh="handleGet"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { ListField, ListFieldType } from '@/api/manager/field/api';
import { Field, FieldType, ListFieldRequest } from '@/api/manager/field/type';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const formRef = ref();
const form = ref<Field>({} as Field);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const types = ref<FieldType[]>([]);
const searchForm = ref<ListFieldRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '字段名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '字段标识',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '字段类型',
		dataIndex: 'type',
		slotName: 'type'
	},
	{
		title: '字段描述',
		dataIndex: 'description',
		slotName: 'description'
	},
	{
		title: '字段状态',
		dataIndex: 'status',
		slotName: 'status'
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
		dataIndex: 'operations',
		slotName: 'operations'
	}
]);

const sortByQueryParams = (property) => {
	// 默认升序
	const asc = -1;
	return (value1, value2) => {
		const a = value1[property];
		const b = value2[property];
		// eslint-disable-next-line no-nested-ternary
		return a < b ? asc : a > b ? asc * -1 : 0;
	};
};

// handleGet 处理查询
const handleGetTypes = async () => {
	const { data } = await ListFieldType();
	data.list.sort(sortByQueryParams('name'));
	types.value = data.list;
};
handleGetTypes();

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListField(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListFieldRequest) => {
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
	form.value = {} as Field;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Field) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
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
	name: 'ManagerField'
};
</script>
