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
			></Table>
			<Form ref="formRef" :data="form" :extra-fields="extraFields" :channels="channels" @add="handleAdd" @update="handleUpdate"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import { allChannel } from '@/api/user-center/channel';
import { addApp, deleteApp, pageApp, updateApp } from '@/api/user-center/app';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';
import { PageAppReq, App } from '@/api/user-center/types/app';
import { Channel } from '@/api/user-center/types/channel';
import { Field } from '@/api/user-center/types/field';
import { pageField } from '@/api/user-center/field';
import { addDepartmentObject, deleteDepartmentObject } from '@/api/manager/department';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const formRef = ref();
const form = ref<App>({} as App);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const channels = ref<Channel[]>([]);
const extraFields = ref<Field[]>([]);
const searchForm = ref<PageAppReq>({
	page: 1,
	page_size: 10
});

const columns = ref<TableCloumn[]>([
	{
		title: '应用图标',
		slotName: 'logo'
	},
	{
		title: '应用名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '应用标志',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '允许注册',
		slotName: 'allowRegistry'
	},
	{
		title: '应用状态',
		dataIndex: 'status',
		slotName: 'status'
	},
	{
		title: '信息字段',
		dataIndex: 'user_fields',
		slotName: 'user_fields'
	},
	{
		title: '应用版本',
		dataIndex: 'version',
		slotName: 'version'
	},
	{
		title: '应用版权',
		dataIndex: 'copyright',
		slotName: 'copyright'
	},
	{
		title: '应用描述',
		dataIndex: 'description',
		slotName: 'description'
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
		dataIndex: 'operations',
		slotName: 'operations'
	}
]);

// handleChannel 处理查询渠道
const handleGetChannel = async () => {
	const { data } = await allChannel();
	channels.value = data.list;
};

// handleGet 处理查询
const handleGetField = async () => {
	const { data } = await pageField({ page: 1, page_size: 50 });
	extraFields.value = data.list;
};

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await pageApp(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGetChannel();
handleGetField();
handleGet();

// 处理新增
const handleAdd = async (app: App) => {
	const { data } = await addApp(app);
	addDepartmentObject('app', data.id);
	handleGet();

	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: App) => {
	await updateApp(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteApp(id);
	deleteDepartmentObject('app', id);
	handleGet();
	Message.success('删除成功');
};

// 处理查询
const handleSearch = async (req: PageAppReq) => {
	const pageSize = searchForm.value.page_size;
	searchForm.value = {
		...req,
		page: 1,
		page_size: pageSize
	};
	handleGet();
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as App;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: App) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = {} as App;
	formRef.value.showAddDrawer();
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.current;
	searchForm.value.page_size = page.pageSize;
	handleGet();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerApp'
};
</script>
