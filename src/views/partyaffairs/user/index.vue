<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search :roles="roles" @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd"></Tool>
			<Table
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				:total="total"
				:pagination="{
					current: searchForm.page,
					pageSize: searchForm.page_size
				}"
				@page-change="handlePageChange"
				@add="handleTableAdd"
				@update="handleTableUpdate"
				@delete="handleDelete"
				@change-status="handleChangeStatus"
				@offline="handleOffline"
			></Table>
			<Form ref="formRef" :roles="roles" :data="form" @add="handleAdd" @update="handleUpdate"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';
import { Role } from '@/api/manager/types/role';
import { pageUser, addUser, deleteUser, updateUser, changeUserStatus, offlineUser } from '@/api/partyaffairs/user';
import { PageUserReq, User } from '@/api/partyaffairs/types/user';

import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const formRef = ref();
const form = ref<User>({} as User);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const roles = ref<Role>({} as Role);
const total = ref(0);
const searchForm = ref<PageUserReq>({
	page: 1,
	page_size: 10
});

const columns = ref<TableCloumn[]>([
	{
		title: '用户昵称',
		dataIndex: 'nickname'
	},
	{
		title: '用户姓名',
		dataIndex: 'name'
	},
	{
		title: '用户电话',
		dataIndex: 'phone'
	},
	{
		title: '用户头像',
		dataIndex: 'avatar',
		slotName: 'avatar'
	},
	{
		title: '用户邮箱',
		dataIndex: 'email'
	},
	{
		title: '用户性别',
		dataIndex: 'gender',
		slotName: 'gender'
	},
	{
		title: '用户状态',
		dataIndex: 'status',
		slotName: 'status'
	},
	{
		title: '最后登录时间',
		dataIndex: 'last_login',
		slotName: 'lastLogin',
		width: 170
	},
	{
		title: '创建时间',
		dataIndex: 'created_at',
		slotName: 'createdAt',
		width: 170
	},
	{
		title: '更新时间',
		dataIndex: 'updated_at',
		slotName: 'updatedAt',
		width: 170
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations',
		fixed: 'right',
		width: 150
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await pageUser(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: PageUserReq) => {
	const pageSize = searchForm.value.page_size;
	searchForm.value = {
		...req,
		page: 1,
		page_size: pageSize
	};

	handleGet();
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.current;
	searchForm.value.page_size = page.pageSize;
	handleGet();
};

// 处理新增
const handleAdd = async (data: User) => {
	await addUser(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: User) => {
	await updateUser(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteUser(id);
	handleGet();
	Message.success('删除成功');
};

// 处理禁用用户
const handleChangeStatus = (user: User) => {
	changeUserStatus(user.id, user.status)
		.then((res) => {
			Message.success('禁用成功');
		})
		.catch(() => {
			user.status = !user.status;
		});
};

// 处理用户下线
const handleOffline = async (id: number) => {
	await offlineUser(id);
	Message.success('下线成功！');
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as User;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (data: User) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = { id } as User;
	formRef.value.showAddDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerUser'
};
</script>
