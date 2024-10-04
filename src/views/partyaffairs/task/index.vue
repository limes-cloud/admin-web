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
				:pagination="{
					page: searchForm.page,
					pageSize: searchForm.pageSize
				}"
				@page-change="handlePageChange"
				@update="handleTableUpdate"
				@refresh="handleGet"
				@value="taskId = $event"
			></Table>
			<Form ref="formRef" :data="form" @refresh="handleGet"></Form>
			<a-modal :visible="taskId != 0" :body-style="{ padding: 0 }" fullscreen unmount-on-close title="填写详情" :footer="false" @cancel="taskId = 0">
				<Value :task-id="taskId"></Value>
			</a-modal>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { ListTaskRequest, Task } from '@/api/partyaffairs/task/type';
import { ListTask, GetTask } from '@/api/partyaffairs/task/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Value from './components/value/index.vue';

const formRef = ref();
const form = ref<Task>({} as Task);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListTaskRequest>({
	page: 1,
	pageSize: 10
});
const taskId = ref(0);

const columns = ref<TableColumn[]>([
	{
		title: '任务标题',
		dataIndex: 'title'
	},
	{
		title: '开始时间',
		dataIndex: 'start',
		slotName: 'start'
	},
	{
		title: '结束时间',
		dataIndex: 'end',
		slotName: 'end'
	},
	{
		title: '允许更新',
		dataIndex: 'isUpdate',
		slotName: 'isUpdate'
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
		slotName: 'operations',
		fixed: 'right',
		width: 100
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListTask(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListTaskRequest) => {
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
	form.value = { isUpdate: false } as Task;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (task: Task) => {
	const { data } = await GetTask(task.id);
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerTask'
};
</script>
