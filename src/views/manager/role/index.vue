<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd"></Tool>
			<Table
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				@add="handleTableAdd"
				@update="handleTableUpdate"
				@refresh="handleGet"
				@update-menu="handleTableUpdateMenu"
			></Table>
			<Form ref="formRef" :roles="tableData" :departments="departments" :data="form" @refresh="handleGet"></Form>
			<SelectMenu ref="menuRef" :menus="(menus as TreeNodeData[])" :keys="menuKeys" @update="handleUpdateMenu"></SelectMenu>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message, TreeNodeData } from '@arco-design/web-vue';
import { ListDepartment } from '@/api/manager/department/api';
import { ListMenuByCurRole } from '@/api/manager/menu/api';
import { Menu } from '@/api/manager/menu/type';
import { Role, UpdateRoleMenuRequest } from '@/api/manager/role/type';
import { GetRoleMenuIds, ListRole, UpdateRoleMenu } from '@/api/manager/role/api';
import { Department } from '@/api/manager/department/type';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import SelectMenu from './components/select-menu.vue';

const menuRef = ref();
const formRef = ref();
const form = ref<Role>({} as Role);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const departments = ref<Department[]>([]);
const menus = ref<Menu[]>([]);
const menuKeys = ref<number[]>([]);

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
		title: '角色菜单',
		slotName: 'menu'
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations'
	}
]);

const handleGetDepartment = async () => {
	const { data } = await ListDepartment();
	departments.value = data.list;
};

const handleGetMenu = async () => {
	const { data } = await ListMenuByCurRole();
	menus.value = data.list;
};

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListRole();
		tableData.value = data.list;
	} finally {
		setLoading(false);
	}
};

handleGet();
handleGetDepartment();
handleGetMenu();

// 处理更新菜单
const handleUpdateMenu = async (keys: number[]) => {
	const data: UpdateRoleMenuRequest = {
		roleId: form.value.id,
		menuIds: keys
	};

	await UpdateRoleMenu(data);
	Message.success('菜单更新成功');
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

// 处理table点击更新菜单
const handleTableUpdateMenu = async (role: Role) => {
	const { data } = await GetRoleMenuIds({ roleId: role.id });
	menuKeys.value = data.list;
	form.value.id = role.id;
	menuRef.value.showUpdateDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerRole'
};
</script>
