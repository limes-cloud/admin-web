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
				@app="handleTableApp"
			></Table>
			<Form ref="formRef" @refresh="handleGet"></Form>
		</div>
		<a-modal
			v-model:visible="showApp"
			title="租户应用套餐管理"
			unmount-on-close
			:modal-style="{ width: '80%', maxWidth: '800px' }"
			:body-style="{ padding: 0, height: '500px' }"
			:footer="false"
		>
			<App :tenant-id="tenantId" />
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Tenant, ListTenantRequest } from '@/api/manager/tenant/type';
import { ListTenant } from '@/api/manager/tenant/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import App from './app/index.vue';

const showApp = ref(false);
const tenantId = ref(0);

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListTenantRequest>({
	page: 1,
	pageSize: 10,
	order: 'desc',
	orderBy: 'weight'
});

const columns = ref<TableColumn[]>([
	{
		title: '租户ID',
		dataIndex: 'id'
	},
	{
		title: '租户图标',
		slotName: 'logo'
	},
	{
		title: '租户名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '租户标识',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '租户状态',
		dataIndex: 'status',
		slotName: 'status'
	},
	{
		title: '租户权重',
		dataIndex: 'weight'
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
		const { data } = await ListTenant(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListTenantRequest) => {
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
const handleTableUpdate = (data: Tenant) => {
	formRef.value.showUpdateDrawer(data);
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.page;
	searchForm.value.pageSize = page.pageSize;
	handleGet();
};

const handleTableApp = async (data: Tenant) => {
	tenantId.value = data.id;
	showApp.value = true;
};
</script>

<script lang="ts">
export default {
	name: 'ManagerTenant'
};
</script>
