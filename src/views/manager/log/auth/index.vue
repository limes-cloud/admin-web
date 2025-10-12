<template>
	<div class="container">
		<Breadcrumb />
		<div class="general-card">
			<Search @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet"></Tool>
			<Table
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				:total="total"
				:pagination="searchForm"
				@page-change="handlePageChange"
				@refresh="handleGet"
			></Table>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { ListAuthLogRequest } from '@/api/manager/auth/type';
import { ListAuthLog } from '@/api/manager/auth/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Search from './components/search.vue';

const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListAuthLogRequest>({
	page: 1,
	pageSize: 10,
	createdAts: []
});

const columns = ref<TableColumn[]>([
	{
		title: '鉴权账户',
		dataIndex: 'username'
	},
	{
		title: '鉴权接口',
		dataIndex: 'api'
	},
	{
		title: '接口方法',
		dataIndex: 'method'
	},
	// {
	// 	title: '鉴权结果',
	// 	dataIndex: 'description'
	// },
	{
		title: '鉴权时间',
		slotName: 'createdAt',
		width: 170
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListAuthLog(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListAuthLogRequest) => {
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
</script>

<script lang="ts">
export default {
	name: 'ManagerUser'
};
</script>
