<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleKnowledgeAdd" @show-group="showGroup = true"></Tool>
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
			<Form ref="formRef" @refresh="handleGet"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { ListKnowledgeRequest, Knowledge } from '@/api/ai-agent/knowledge/type';
import { ListKnowledge } from '@/api/ai-agent/knowledge/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const showGroup = ref(false);
const showLog = ref(false);
const logId = ref(0);
const searchForm = ref<ListKnowledgeRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '知识库标题',
		dataIndex: 'title'
	},
	{
		title: '是否公开',
		slotName: 'isOpen'
	},
	{
		title: '知识库类型',
		dataIndex: 'type'
	},
	{
		title: '知识库状态',
		slotName: 'status'
	},
	{
		title: '知识库描述',
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
		slotName: 'operations',
		fixed: 'right',
		width: 100
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListKnowledge(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListKnowledgeRequest) => {
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

const handleShowLog = (knowledge: Knowledge) => {
	logId.value = knowledge.id;
	showLog.value = true;
};

//  处理knowledge按钮新建
const handleKnowledgeAdd = () => {
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (knowledge: Knowledge) => {
	formRef.value.showUpdateDrawer(knowledge);
};
</script>
