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
			<Form ref="formRef" :dept-id="deptId" @refresh="handleGet"></Form>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { ListDeptRoleRequest, Role } from '@/api/manager/dept/type';
import { DeleteDeptRoles, ListDeptRole } from '@/api/manager/dept/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import { Message } from '@arco-design/web-vue';

const props = defineProps<{ deptId: number }>();

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListDeptRoleRequest>({
	page: 1,
	pageSize: 10
} as ListDeptRoleRequest);

const columns = ref<TableColumn[]>([
	{
		title: '角色ID',
		dataIndex: 'id'
	},
	{
		title: '角色名称',
		dataIndex: 'name'
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
		searchForm.value.deptId = props.deptId;
		const { data } = await ListDeptRole(searchForm.value);
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
const handleSearch = async (req: ListDeptRoleRequest) => {
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
const handleTableUpdate = (data: Role) => {
	formRef.value.showUpdateDrawer(data);
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.page;
	searchForm.value.pageSize = page.pageSize;
	handleGet();
};

const handleDelete = async (roleIds: number[]) => {
	await DeleteDeptRoles({ deptId: props.deptId, roleIds });
	Message.success('删除成功');
	handleGet();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerDeptRole'
};
</script>
<style lang="less" scoped>
.container {
	flex-grow: 1;
}
</style>
