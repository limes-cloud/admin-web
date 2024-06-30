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
				@refresh="handleGet"
			></Table>
			<Form ref="formRef" :data="form" @refresh="handleGet"></Form>
		</a-card>
		<a-modal v-model:visible="showGroup" title="节点分组" width="780px" :body-style="{ padding: 0 }" :footer="false">
			<Group />
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { WorkerGroup, Worker, ListWorkerRequest } from '@/api/cron/worker/type';
import { ListWorker } from '@/api/cron/worker/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Group from './components/group/index.vue';

const formRef = ref();
const form = ref<Worker>({} as Worker);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const groups = ref<WorkerGroup[]>([]);
const total = ref(0);
const showGroup = ref(false);
const searchForm = ref<ListWorkerRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '节点名称',
		dataIndex: 'name'
	},
	{
		title: '节点ip',
		dataIndex: 'ip'
	},
	{
		title: '节点分组',
		slotName: 'group'
	},
	{
		title: '节点状态',
		dataIndex: 'status',
		slotName: 'status'
	},
	{
		title: '节点描述',
		dataIndex: 'description'
	},
	{
		title: '创建时间',
		slotName: 'createdAt'
	},
	{
		title: '更新时间',
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
		const { data } = await ListWorker(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListWorkerRequest) => {
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
	form.value = {} as Worker;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (worker: Worker) => {
	form.value = { ...worker };
	formRef.value.showUpdateDrawer();
};
</script>
