<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @search="handleSearch"></Search>
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
				@disable="handleDisable"
				@enable="handleEnable"
				@offline="handleOffline"
				@more="handleMore"
			></Table>
			<Form ref="formRef" :data="form" @add="handleAdd" @update="handleUpdate"></Form>
			<More ref="moreRef" :user="curUser" @add-app="handleAddUserApp" @delete-app="handleDeleteUserApp"></More>
			<!-- @add-channel="handleAddUserApp"
				@delete-channel="handleDeleteUserApp" -->
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';

import { PageUserReq, User } from '@/api/user-center/types/user';
import { getUser, pageUser, addUser, deleteUser, updateUser, disableUser, enableUser, offlineUser } from '@/api/user-center/user';

import { AddUserAppReq, DeleteUserAppReq } from '@/api/user-center/types/user-app';
import { addUserApp, deleteUserApp } from '@/api/user-center/user-app';
// import { AddUserChannelReq, DeleteUserChannelReq } from '@/api/user-center/types/user-channel';
// import { addUserChannel, deleteUserChannel } from '@/api/user-center/user-channel';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import More from './components/more.vue';

const moreRef = ref();
const formRef = ref();
const form = ref<User>({} as User);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const curUser = ref<User>({} as User);
const total = ref(0);
const searchForm = ref<PageUserReq>({
	page: 1,
	page_size: 10
});

const columns = ref<TableCloumn[]>([
	{
		title: '昵称',
		dataIndex: 'nick_name'
	},
	{
		title: '姓名',
		dataIndex: 'real_name'
	},
	{
		title: '头像',
		dataIndex: 'avatar',
		slotName: 'avatar'
	},
	{
		title: '性别',
		dataIndex: 'gender',
		slotName: 'gender'
	},
	{
		title: '账户',
		dataIndex: 'username'
	},
	{
		title: '电话',
		dataIndex: 'phone'
	},
	{
		title: '邮箱',
		dataIndex: 'email'
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
		width: 230
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
const handleDisable = (user: User) => {
	disableUser(user.id, user.disable_desc)
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

// 处理启用用户
const handleEnable = (user: User) => {
	enableUser(user.id as number)
		.then(() => {
			Message.success('启用成功');
		})
		.catch(() => {
			user.status = !user.status;
		});
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

const handleMore = async (id: number) => {
	const { data } = await await getUser(id);
	curUser.value = data;
	moreRef.value.show();
};

const handleAddUserApp = async (ua: AddUserAppReq) => {
	await addUserApp(ua);
	const { data } = await await getUser(ua.user_id);
	curUser.value = data;
	Message.success('添加成功');
};

const handleDeleteUserApp = async (ua: DeleteUserAppReq) => {
	await deleteUserApp(ua);
	const { data } = await await getUser(ua.user_id);
	curUser.value = data;
	Message.success('删除成功');
};

// const handleAddUserChannel = async (uc: AddUserChannelReq) => {
// 	await addUserChannel(uc);
// 	const { data } = await await getUser(uc.user_id);
// 	curUser.value = data;
// 	Message.success('添加成功');
// };

// const handleDeleteUserChannel = async (uc: DeleteUserChannelReq) => {
// 	await deleteUserChannel(uc);
// 	const { data } = await await getUser(uc.user_id);
// 	curUser.value = data;
// 	Message.success('删除成功');
// };

// const handleAddUserExtra = async (ua: AddUserAppReq) => {
// 	await addUserApp(ua);
// 	const { data } = await await getUser(ua.user_id);
// 	curUser.value = data;
// 	Message.success('添加成功');
// };

// const handleDeleteUserExtra = async (ua: DeleteUserAppReq) => {
// 	await deleteUserApp(ua);
// 	const { data } = await await getUser(ua.user_id);
// 	curUser.value = data;
// 	Message.success('删除成功');
// };
</script>

<script lang="ts">
export default {
	name: 'UserCenter'
};
</script>
