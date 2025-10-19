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
				@dept="handleDept"
				@info="handleInfo"
			></Table>
			<Form ref="formRef" @refresh="handleGet"></Form>
		</div>
		<a-modal
			v-model:visible="showDept"
			title="部门绑定"
			:modal-style="{ width: '480px' }"
			:body-style="{ padding: 0, height: '60%', minHeight: '500px', display: 'flex', flexDirection: 'column' }"
			:footer="false"
			unmount-on-close
		>
			<Dept :user-id="userId" />
		</a-modal>

		<a-modal
			v-model:visible="showInfo"
			title="信息管理"
			:modal-style="{ width: '480px' }"
			:body-style="{ padding: 0, height: '60%', minHeight: '500px', display: 'flex', flexDirection: 'column' }"
			:footer="false"
			unmount-on-close
		>
			<Info :user-id="userId" />
		</a-modal>
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
import Dept from './dept/index.vue';
import Info from './info/index.vue';

const showDept = ref(false);
const showInfo = ref(false);

const userId = ref<number>(0);

const formRef = ref();
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
		title: '用户账号',
		dataIndex: 'username'
	},
	{
		title: '用户头像',
		slotName: 'avatar'
	},
	{
		title: '用户状态',
		slotName: 'status'
	},
	{
		title: '所属部门',
		dataIndex: 'dept.name'
	},
	{
		title: '担任职位',
		dataIndex: 'job.name'
	},
	{
		title: '用户状态',
		slotName: 'status'
	},
	{
		title: '最后登录时间',
		slotName: 'loggedAt',
		width: 170
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
		slotName: 'operations',
		fixed: 'right',
		width: 60
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
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (user: User) => {
	const { data } = await GetUser({ id: user.id });
	formRef.value.showUpdateDrawer(data);
};

const handleDept = (data: User) => {
	userId.value = data.id;
	showDept.value = true;
};

const handleInfo = (data: User) => {
	userId.value = data.id;
	showInfo.value = true;
};
</script>

<script lang="ts">
export default {
	name: 'ManagerUser'
};
</script>
