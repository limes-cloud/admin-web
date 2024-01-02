<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @select="handleSelect"></Search>
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
import { pageTaskValue, deleteTaskValue } from '@/api/partyaffairs/task_value';
import { PageTaskValueReq } from '@/api/partyaffairs/types/task_value';
import Table from './components/table.vue';
import Search from './components/search.vue';

const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<PageTaskValueReq>({
	page: 1,
	page_size: 10,
	task_id: 0
});

const columns = ref<TableCloumn[]>([
	{
		title: '姓名',
		slotName: 'name'
	},
	{
		title: '电话',
		slotName: 'phone'
	},
	{
		title: '填写时间',
		dataIndex: 'created_at',
		slotName: 'createdAt'
	},
	{
		title: '更新时间',
		dataIndex: 'updated_at',
		slotName: 'updatedAt'
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations',
		fixed: 'right',
		width: 100
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await pageTaskValue(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

// 处理查询
const handleSelect = async (taskId: number) => {
	const pageSize = searchForm.value.page_size;
	searchForm.value = {
		task_id: taskId,
		page: 1,
		page_size: pageSize
	};

	handleGet();
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.current;
	searchForm.value.page_size = page.pageSize;
	handleGet();
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteTaskValue(id);
	handleGet();
	Message.success('删除成功');
};
</script>

<script lang="ts">
export default {
	name: 'ManagerTaskValue'
};
</script>
