<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @search="handleSearch"></Search>
			<ToolEle v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd" @show-group="showGroup = true"></ToolEle>
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
				@exec="handleExec"
			></Table>
			<Form ref="formRef" @refresh="handleGet"></Form>
			<Exec ref="execRef"></Exec>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { ListToolRequest, Tool } from '@/api/ai-agent/tool/type';
import { ListTool } from '@/api/ai-agent/tool/api';
import ToolEle from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Exec from './components/exec.vue';

const execRef = ref();
const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const showGroup = ref(false);
const showLog = ref(false);
const logId = ref(0);
const searchForm = ref<ListToolRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '工具图标',
		slotName: 'icon'
	},
	{
		title: '工具标识',
		dataIndex: 'keyword'
	},
	{
		title: '工具类型',
		slotName: 'type'
	},
	{
		title: '是否公开',
		slotName: 'isOpen'
	},
	{
		title: '工具标题',
		dataIndex: 'title'
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
		const { data } = await ListTool(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListToolRequest) => {
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

const handleShowLog = (tool: Tool) => {
	logId.value = tool.id;
	showLog.value = true;
};

//  处理tool按钮执行
const handleExec = (tool: Tool) => {
	execRef.value.showAddDrawer(tool);
};

//  处理tool按钮新建
const handleToolAdd = () => {
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (tool: Tool) => {
	formRef.value.showUpdateDrawer(tool);
};
</script>
