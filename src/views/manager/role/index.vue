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
				@add="handleTableAdd"
				@update="handleTableUpdate"
				@refresh="handleGet"
				@menu="handleMenu"
				@entity="handleEntity"
			></Table>
			<Form ref="formRef" :roles="tableData" :data="form" @refresh="handleGet"></Form>
			<Menu ref="menuRef"></Menu>
			<Data ref="dataRef"></Data>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { ListRoleRequest, Role } from '@/api/manager/role/type';
import { ListCurrentRole } from '@/api/manager/role/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Menu from './components/menu.vue';
import Data from './entity/index.vue';

const dataRef = ref();
const menuRef = ref();
const formRef = ref();
const form = ref<Role>({} as Role);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<Role[]>();

const searchForm = ref<ListRoleRequest>({});

const size = ref<TableSize>('medium');
const columns = ref<TableColumn[]>([
	{
		title: '角色名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '角色标识',
		dataIndex: 'keyword'
	},
	{
		title: '角色状态',
		dataIndex: 'status',
		slotName: 'status'
	},
	{
		title: '角色描述',
		dataIndex: 'description'
	},
	{
		title: '创建时间',
		dataIndex: 'createdAt',
		slotName: 'createdAt'
	},
	{
		title: '更新时间',
		dataIndex: 'updatedAt',
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
		const { data } = await ListCurrentRole(searchForm.value);
		tableData.value = data.list;
	} finally {
		setLoading(false);
	}
};

handleGet();

const handleSearch = async (req: ListRoleRequest) => {
	searchForm.value = {
		...searchForm.value,
		...req
	};

	handleGet();
};

const handleMenu = (data: Role) => {
	menuRef.value.show(data.id);
};

const handleEntity = (data: Role) => {
	dataRef.value.show(data.id);
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = { status: true } as Role;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Role) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

const handleTableAdd = (id: number) => {
	form.value = { parentId: id, status: true } as Role;
	formRef.value.showAddDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerRole'
};
</script>
