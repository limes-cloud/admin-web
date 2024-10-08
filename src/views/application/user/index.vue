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
				@more="handleMore"
				@refresh="handleGet"
			></Table>
			<Form ref="formRef" :data="form" @refresh="handleGet"></Form>
			<More ref="moreRef"></More>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { User, ListUserRequest } from '@/api/application/user/type';
import { ListUser } from '@/api/application/user/api';
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
const total = ref(0);
const searchForm = ref<ListUserRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '昵称',
		dataIndex: 'nickName'
	},
	{
		title: '姓名',
		dataIndex: 'realName'
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
		title: '状态',
		dataIndex: 'status',
		slotName: 'status'
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
		width: 230
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListUser(searchForm.value);
		tableData.value = data.list;
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
const handleTableUpdate = async (data: User) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

const handleMore = async (id: number) => {
	moreRef.value.show(id);
};
</script>

<script lang="ts">
export default {
	name: 'UserCenter'
};
</script>
