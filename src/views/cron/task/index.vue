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
				:pagination="searchForm"
				@page-change="handlePageChange"
				@update="handleTableUpdate"
				@log="handleShowLog"
				@refresh="handleGet"
			></Table>
			<Form ref="formRef" :groups="groups" @refresh="handleGet"></Form>
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
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { TaskGroup, Task, ListTaskRequest } from '@/api/cron/task/type';
import { ListTask } from '@/api/cron/task/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Group from './components/group/index.vue';
import Log from './components/log.vue';

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const groups = ref<TaskGroup[]>([]);
const total = ref(0);
const showGroup = ref(false);
const showLog = ref(false);
const logId = ref(0);
const searchForm = ref<ListTaskRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
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

const handleShowLog = (task: Task) => {
	logId.value = task.id;
	showLog.value = true;
};

//  处理tool按钮新建
const handleToolAdd = () => {
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (task: Task) => {
	formRef.value.showUpdateDrawer(task.id);
};
</script>
