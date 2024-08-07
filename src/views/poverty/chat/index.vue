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
			></Table>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { ListChatRecordRequest } from '@/api/poverty/chat/type';
import { ListChatRecord } from '@/api/poverty/chat/api';

import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Search from './components/search.vue';

const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListChatRecordRequest>({
	page: 1,
	pageSize: 10,
	distinct: true
});

const columns = ref<TableColumn[]>([
	{
		title: '用户ID',
		dataIndex: 'userId'
	},
	{
		title: '用户名称',
		slotName: 'userName'
	},
	{
		title: '用户头像',
		slotName: 'userAvatar'
	},
	{
		title: '信息',
		dataIndex: 'message'
	},
	{
		title: '类型',
		slotName: 'type'
	},
	{
		title: '创建时间',
		slotName: 'createdAt',
		width: 170
	}
	// {
	// 	title: '操作',
	// 	slotName: 'operations',
	// 	fixed: 'right',
	// 	width: 150
	// }
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListChatRecord(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListChatRecordRequest) => {
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
	name: 'PovertyChatRecord'
};
</script>
