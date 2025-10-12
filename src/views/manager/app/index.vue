<template>
	<div class="container">
		<Breadcrumb />
		<div class="general-card">
			<Search @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd"></Tool>
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
				@channel="handleTableChannel"
				@field="handleTableField"
			></Table>
			<Form ref="formRef" @refresh="handleGet"></Form>
		</div>
		<a-modal
			v-model:visible="showChannel"
			title="应用授权渠道管理"
			unmount-on-close
			:modal-style="{ width: '80%', maxWidth: '800px' }"
			:body-style="{ padding: 0, height: '500px' }"
			:footer="false"
		>
			<Channel :app-id="appId" />
		</a-modal>
		<a-modal
			v-model:visible="showField"
			title="应用信息字段管理"
			unmount-on-close
			:modal-style="{ width: '80%', maxWidth: '800px' }"
			:body-style="{ padding: 0, height: '500px' }"
			:footer="false"
		>
			<Field :app-id="appId" />
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { useAppStore } from '@/store';

import { App, ListAppRequest } from '@/api/manager/app/type';
import { ListApp, ListCurrentApp } from '@/api/manager/app/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Channel from './channel/index.vue';
import Field from './field/index.vue';
import { ListTenantApp } from '@/api/manager/tenant/api';
const showField = ref(false);
const showChannel = ref(false);
const appId = ref(0);

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListAppRequest>({
	page: 1,
	pageSize: 10
});

const { permissions } = useAppStore();

const columns = ref<TableColumn[]>([
	{
		title: '应用ID',
		dataIndex: 'id'
	},
	{
		title: '应用图标',
		slotName: 'logo'
	},
	{
		title: '应用名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '应用标识',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '是否私有',
		slotName: 'private'
	},
	{
		title: '应用状态',
		dataIndex: 'status',
		slotName: 'status'
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
		slotName: 'operations'
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		if (!permissions.has('manager:app:query')) {
			const { data } = await ListCurrentApp({ ...searchForm.value });
			tableData.value = data.list;
			total.value = data.total;
		} else {
			const { data } = await ListApp(searchForm.value);
			tableData.value = data.list;
			total.value = data.total;
		}
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListAppRequest) => {
	const { pageSize } = searchForm.value;
	searchForm.value = {
		...req,
		page: 1,
		pageSize
	};
	handleGet();
};

//  处理tool按钮新建
const handleToolAdd = () => {
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: App) => {
	formRef.value.showUpdateDrawer(data);
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.page;
	searchForm.value.pageSize = page.pageSize;
	handleGet();
};

// 处理table点击渠道
const handleTableChannel = (data: App) => {
	appId.value = data.id;
	showChannel.value = true;
};

// 处理table点击字段
const handleTableField = (data: App) => {
	appId.value = data.id;
	showField.value = true;
};
</script>

<script lang="ts">
export default {
	name: 'ManagerApp'
};
</script>
