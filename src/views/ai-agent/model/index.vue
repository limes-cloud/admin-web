<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @search="handleSearch"></Search>
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
			<Form ref="formRef" @refresh="handleGet"></Form>
		</a-card>
		<a-modal
			v-model:visible="showGroup"
			title="模型分组"
			:modal-style="{ width: '80%', maxWidth: '800px' }"
			:body-style="{ padding: 0 }"
			:footer="false"
		>
			<Group />
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { Model, ListModelRequest } from '@/api/ai-agent/model/type';
import { ListModel } from '@/api/ai-agent/model/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const showGroup = ref(false);
const showLog = ref(false);
const logId = ref(0);
const searchForm = ref<ListModelRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '模型类型',
		dataIndex: 'type'
	},
	{
		title: '模型标题',
		dataIndex: 'title'
	},
	{
		title: '模型标识',
		dataIndex: 'keyword'
	},
	{
		title: 'json回复',
		slotName: 'supportJson'
	},
	{
		title: '工具能力',
		slotName: 'supportTool'
	},
	{
		title: '密钥分组',
		dataIndex: 'secretGroup.name'
	},
	{
		title: '模型描述',
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
		const { data } = await ListModel(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListModelRequest) => {
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

const handleShowLog = (model: Model) => {
	logId.value = model.id;
	showLog.value = true;
};

//  处理tool按钮新建
const handleToolAdd = () => {
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (model: Model) => {
	formRef.value.showUpdateDrawer(model);
};
</script>
