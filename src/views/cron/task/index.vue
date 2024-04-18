<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search :groups="groups" @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd" @show-group="showGroup = true"></Tool>
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
				@add="handleTableAdd"
				@update="handleTableUpdate"
				@delete="handleDelete"
				@enable="handleEnable"
				@disable="handleDisable"
				@exec="handleExec"
				@log="handleShowLog"
			></Table>
			<Form ref="formRef" :data="form" :groups="groups" @add="handleAdd" @update="handleUpdate"></Form>
		</a-card>
		<a-modal
			v-model:visible="showGroup"
			title="任务分组"
			:modal-style="{ height: '80%', width: '80%', maxWidth: '800px' }"
			:body-style="{ padding: 0 }"
			:footer="false"
		>
			<Group />
		</a-modal>
		<a-modal
			v-model:visible="showLog"
			:modal-style="{ height: '80%', width: '80%', maxWidth: '900px' }"
			unmount-on-close
			title="任务日志"
			:body-style="{ padding: 0, height: 'calc(100% - 48px)' }"
			:footer="false"
		>
			<Log :id="logId" />
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';

import { TaskGroup, Task, PageTaskReq } from '@/api/cron/types/task';
import { addTask, allTaskGroup, deleteTask, disableTask, enableTask, execTask, pageTask, updateTask } from '@/api/cron/task';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Group from './components/group/index.vue';
import Log from './components/log.vue';

const formRef = ref();
const form = ref<Task>({} as Task);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const groups = ref<TaskGroup[]>([]);
const total = ref(0);
const showGroup = ref(false);
const showLog = ref(false);
const logId = ref(0);
const searchForm = ref<PageTaskReq>({
	page: 1,
	page_size: 10
});

const columns = ref<TableCloumn[]>([
	{
		title: '任务名称',
		dataIndex: 'name'
	},
	{
		title: '任务标签',
		dataIndex: 'tag'
	},
	{
		title: '任务分组',
		dataIndex: 'group_id',
		slotName: 'group'
	},
	{
		title: '任务状态',
		dataIndex: 'status',
		slotName: 'status'
	},
	{
		title: '任务描述',
		dataIndex: 'description'
	},
	{
		title: '创建时间',
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

const handleGetGroup = async () => {
	const { data } = await allTaskGroup();
	groups.value = data.list;
};

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await pageTask(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();
handleGetGroup();

// 处理查询
const handleSearch = async (req: PageTaskReq) => {
	const pageSize = searchForm.value.page_size;
	searchForm.value = {
		...req,
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

// 处理新增
const handleAdd = async (data: Task) => {
	await addTask(data);
	handleGet();
	Message.success('创建成功');
};

// 处理禁用任务
const handleDisable = (task: Task) => {
	disableTask(task.id).then(() => {
		Message.success('禁用成功');
		handleGet();
	});
};

// 处理启用任务
const handleEnable = (task: Task) => {
	enableTask(task.id as number).then(() => {
		Message.success('启用成功');
		handleGet();
	});
};

const handleExec = (task: Task) => {
	execTask(task.id as number).then(() => {
		Message.success('执行成功');
		handleGet();
	});
};

const handleShowLog = (task: Task) => {
	logId.value = task.id;
	showLog.value = true;
};

// 处理修改
const handleUpdate = async (data: Task) => {
	await updateTask(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteTask(id);
	handleGet();
	Message.success('删除成功');
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as Task;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (task: Task) => {
	form.value = { ...task };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = { id } as Task;
	formRef.value.showAddDrawer();
};
</script>
