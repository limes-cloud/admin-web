<template>
	<Popup
		v-model:visible="visible"
		title="数据权限设置"
		width="680px"
		@cancel="visible = false"
		:body-style="{ padding: '0', height: '500px' }"
		:footer="false"
	>
		<div class="container">
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
				></Table>
				<Form ref="formRef" :role-id="roleId" @refresh="handleGet"></Form>
			</div>
		</div>
	</Popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { RoleEntity, ListRoleEntityRequest } from '@/api/manager/role/type';
import { ListRoleEntity } from '@/api/manager/role/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const roleId = ref(0);
const visible = ref(false);

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListRoleEntityRequest>({
	page: 1,
	pageSize: 10
} as ListRoleEntityRequest);

const columns = ref<TableColumn[]>([
	{
		title: '所属应用',
		slotName: 'app'
	},
	{
		title: '所属实体',
		slotName: 'entity'
	},
	{
		title: '操作类型',
		slotName: 'action'
	},
	{
		title: '权限范围',
		slotName: 'scope'
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
		const { data } = await ListRoleEntity({ ...searchForm.value, roleId: roleId.value });
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

// 处理查询
const handleSearch = async (req: ListRoleEntityRequest) => {
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
const handleTableUpdate = (data: RoleEntity) => {
	formRef.value.showUpdateDrawer(data);
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.page;
	searchForm.value.pageSize = page.pageSize;
	handleGet();
};

const show = (id: number) => {
	roleId.value = id;
	visible.value = true;

	handleGet();
};

defineExpose({ show });
</script>
