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
			title="密钥分组"
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

import { SecretGroup, Secret, ListSecretRequest } from '@/api/ai-agent/secret/type';
import { ListSecret } from '@/api/ai-agent/secret/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Group from './components/group/index.vue';

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const groups = ref<SecretGroup[]>([]);
const total = ref(0);
const showGroup = ref(false);
const showLog = ref(false);
const logId = ref(0);
const searchForm = ref<ListSecretRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '密钥token',
		dataIndex: 'token'
	},
	{
		title: '密钥分组',
		dataIndex: 'group_id',
		slotName: 'group'
	},
	{
		title: '密钥状态',
		dataIndex: 'status',
		slotName: 'status'
	},
	{
		title: '密钥描述',
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
		const { data } = await ListSecret(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListSecretRequest) => {
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

const handleShowLog = (secret: Secret) => {
	logId.value = secret.id;
	showLog.value = true;
};

//  处理tool按钮新建
const handleToolAdd = () => {
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (secret: Secret) => {
	formRef.value.showUpdateDrawer(secret);
};
</script>
