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
				@delete="handleDelete"
				@update-menu="handleTableUpdateMenu"
			></Table>
			<Form ref="formRef" :roles="tableData" :departments="departments" :data="form" @add="handleAdd" @update="handleUpdate"></Form>
			<SelectMenu ref="menuRef" :menus="(menus as TreeNodeData[])" :keys="menuKeys" @update="handleUpdateMenu"></SelectMenu>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableCloumn, TableSize } from '@/types/global';
import { addRole, deleteRole, getRoleTree, updateRole } from '@/api/manager/role';
import { getDepartmentTree } from '@/api/manager/department';
import useLoading from '@/hooks/loading';
import { Role } from '@/api/manager/types/role';
import { Message, TreeNodeData } from '@arco-design/web-vue';
import { Department } from '@/api/manager/types/department';
import { getRoleMenuIds, getRoleMenuTree, updateRoleMenu } from '@/api/manager/role-menu';
import { Menu } from '@/api/manager/types/menu';
import { UpdateRoleMenuReq } from '@/api/manager/types/role-menu';
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
const columns = ref<TableCloumn[]>([
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
		title: '菜单管理',
		slotName: 'menu'
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations'
	}
]);

const handleGetDepartment = async () => {
	const { data } = await getDepartmentTree();
	departments.value = data;
};

const handleGetMenu = async () => {
	const { data } = await getRoleMenuTree();
	menus.value = data;
};

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await getRoleTree();
		tableData.value = [data];
	} finally {
		setLoading(false);
	}
};

handleGet();
handleGetDepartment();
handleGetMenu();

// 处理新增
const handleAdd = async (data: Role) => {
	await addRole(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: Role) => {
	await updateRole(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteRole(id);
	handleGet();
	Message.success('删除成功');
};

// 处理更新菜单
const handleUpdateMenu = async (keys: number[]) => {
	const data: UpdateRoleMenuReq = {
		role_id: form.value.id as number,
		menu_ids: keys
	};

	await updateRoleMenu(data);
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
	form.value = { parent_id: id, status: true } as Role;
	formRef.value.showAddDrawer();
};

// 处理table点击更新菜单
const handleTableUpdateMenu = async (role: Role) => {
	const { data } = await getRoleMenuIds(role.id as number);
	menuKeys.value = data;
	form.value.id = role.id;
	menuRef.value.showUpdateDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerRole'
};
</script>
