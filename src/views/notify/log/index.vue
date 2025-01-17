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
import { ListLog } from '@/api/notify/log/api';
import { ListLogRequest } from '@/api/notify/log/type';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Search from './components/search.vue';

const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const searchForm = ref<ListLogRequest>({
	page: 1,
	pageSize: 10
});
const total = ref(0);
const size = ref<TableSize>('medium');
const columns = ref<TableColumn[]>([
	{
		title: '渠道ID',
		dataIndex: 'id',
		slotName: 'id'
	},
	{
		title: '通知名称',
		dataIndex: 'notify.name'
	},
	{
		title: '渠道名称',
		dataIndex: 'channel.name'
	},
	{
		title: '发送用户',
		dataIndex: 'user'
	},
	{
		title: '发送内容',
		dataIndex: 'content'
	},
	{
		title: '来源',
		dataIndex: 'fromServer'
	},
	{
		title: '来源ip',
		dataIndex: 'fromServer'
	},
	{
		title: '发送状态',
		dataIndex: 'status',
		slotName: 'status'
	},
	{
		title: '发送时间',
		slotName: 'createdAt'
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListLog(searchForm.value);
		tableData.value = data.list;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListLogRequest) => {
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
	name: 'ManagerLog'
};
</script>
