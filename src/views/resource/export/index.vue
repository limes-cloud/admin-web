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
				@delete="handleDelete"
			></Table>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';

import { ListExport, DeleteExport } from '@/api/resource/export/api';
import { ListExportRequest } from '@/api/resource/export/type';
import Table from './components/table.vue';
import Tool from './components/tool.vue';
import Search from './components/search.vue';

const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListExportRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '导出文件',
		dataIndex: 'name'
	},
	{
		title: '导出版本',
		dataIndex: 'sha'
	},
	{
		title: '文件大小',
		dataIndex: 'size',
		slotName: 'size'
	},
	{
		title: '导出状态',
		dataIndex: 'status',
		slotName: 'status'
	},
	{
		title: '过期时间',
		dataIndex: 'expiredAt',
		slotName: 'expiredAt',
		width: 170
	},
	{
		title: '创建时间',
		dataIndex: 'createdAt',
		slotName: 'createdAt',
		width: 170
	},
	{
		title: '更新时间',
		dataIndex: 'updatedAt',
		slotName: 'updatedAt',
		width: 170
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations',
		fixed: 'right',
		width: 200
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListExport(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.page;
	searchForm.value.pageSize = page.pageSize;
	handleGet();
};

// 处理查询
const handleSearch = async (req: ListExportRequest) => {
	const { pageSize } = searchForm.value;
	searchForm.value = {
		...req,
		page: 1,
		pageSize
	};

	handleGet();
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await DeleteExport({ ids: [id] });
	handleGet();
	Message.success('删除成功');
};
</script>

<script lang="ts">
export default {
	name: 'ManagerExport'
};
</script>
