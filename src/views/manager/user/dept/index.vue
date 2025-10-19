<template>
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
				@delete="handleDelete"
				@page-change="handlePageChange"
				@update="handleTableUpdate"
				@refresh="handleGet"
			></Table>
			<Form ref="formRef" :user-id="userId" @refresh="handleGet"></Form>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import useLoading from '@/hooks/loading';

import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import { Message } from '@arco-design/web-vue';
import { ListUserDeptRequest, Dept } from '@/api/manager/user/type';
import { DeleteUserDept, ListUserDept } from '@/api/manager/user/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const props = defineProps<{ userId: number }>();

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListUserDeptRequest>({
	page: 1,
	pageSize: 10
} as ListUserDeptRequest);

const columns = ref<TableColumn[]>([
	{
		title: '部门ID',
		dataIndex: 'id'
	},
	{
		title: '部门名称',
		dataIndex: 'dept.name'
	},
	{
		title: '担任角色',
		dataIndex: 'job.name'
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
		searchForm.value.userId = props.userId;
		const { data } = await ListUserDept(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

onMounted(() => {
	handleGet();
});

// 处理查询
const handleSearch = async (req: ListUserDeptRequest) => {
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
const handleTableUpdate = (data: Dept) => {
	formRef.value.showUpdateDrawer(data);
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.page;
	searchForm.value.pageSize = page.pageSize;
	handleGet();
};

const handleDelete = async (deptId: number) => {
	await DeleteUserDept({ userId: props.userId, deptId: deptId });
	Message.success('删除成功');
	handleGet();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerUserDept'
};
</script>
<style lang="less" scoped>
.container {
	flex-grow: 1;
}
</style>
