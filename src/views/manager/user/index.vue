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
				:pagination="searchForm"
				@page-change="handlePageChange"
				@update="handleTableUpdate"
				@refresh="handleGet"
			></Table>
			<Form ref="formRef" :data="(form as any)" @refresh="handleGet"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { ListUserRequest, User } from '@/api/manager/user/type';
import { GetUser, ListUser } from '@/api/manager/user/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const formRef = ref();
const form = ref({});
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListUserRequest>({
	page: 1,
	pageSize: 10,
	createdAts: [],
	loggedAts: []
});

const columns = ref<TableColumn[]>([
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
		title: '当前角色',
		dataIndex: 'role',
		slotName: 'role'
	},

	{
		title: '用户部门',
		dataIndex: 'team',
		slotName: 'team'
	},
	{
		title: '用户状态',
		dataIndex: 'status',
		slotName: 'status'
	},
	{
		title: '最后登录时间',
		dataIndex: 'loggedAt',
		slotName: 'loggedAt',
		width: 170
	},
	{
		title: '创建时间',
		dataIndex: 'createdAt',
		slotName: 'createdAt',
		width: 170
	},
	{
		title: '更新时间',
		dataIndex: 'updatedAt',
		slotName: 'updatedAt',
		width: 170
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations',
		fixed: 'right',
		width: 240
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListUser(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListUserRequest) => {
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

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as User;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (user: User) => {
	const { data } = await GetUser({ id: user.id });
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerUser'
};
</script>
