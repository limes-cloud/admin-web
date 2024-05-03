<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Table
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				:total="total"
				:pagination="{
					current: searchForm.page,
					pageSize: searchForm.page_size
				}"
				@page-change="handlePageChange"
				@delete="handleDelete"
			></Table>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';

import { pageExport, deleteExport } from '@/api/resource/export';
import Table from './components/table.vue';

const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref({
	page: 1,
	page_size: 10
});

const columns = ref<TableCloumn[]>([
	{
		title: '导出文件',
		dataIndex: 'name'
	},
	{
		title: '导出版本',
		dataIndex: 'version'
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
		title: '创建时间',
		dataIndex: 'created_at',
		slotName: 'createdAt',
		width: 170
	},
	{
		title: '更新时间',
		dataIndex: 'updated_at',
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
		const { data } = await pageExport(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.current;
	searchForm.value.page_size = page.pageSize;
	handleGet();
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteExport(id);
	handleGet();
	Message.success('删除成功');
};
</script>

<script lang="ts">
export default {
	name: 'ManagerExport'
};
</script>
