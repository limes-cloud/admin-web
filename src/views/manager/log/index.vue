<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
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
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { ListLoginLogRequest } from '@/api/manager/user/type';
import { ListLoginLog } from '@/api/manager/user/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Search from './components/search.vue';

const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListLoginLogRequest>({
	page: 1,
	pageSize: 10,
	createdAts: []
});

const columns = ref<TableColumn[]>([
	{
		title: '登陆账户',
		dataIndex: 'username'
	},
	{
		title: '账户类型',
		slotName: 'type'
	},
	{
		title: 'IP信息',
		slotName: 'ip'
	},
	{
		title: '设备信息',
		dataIndex: 'device'
	},
	{
		title: '浏览器信息',
		dataIndex: 'browser'
	},
	{
		title: '状态码',
		slotName: 'code'
	},
	{
		title: '登陆结果',
		dataIndex: 'description'
	},
	{
		title: '登陆时间',
		slotName: 'createdAt',
		width: 170
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListLoginLog(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListLoginLogRequest) => {
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
