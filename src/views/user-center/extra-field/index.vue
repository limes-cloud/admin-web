<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd"></Tool>
			<Table
				:types="types"
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
			<Form ref="formRef" :data="form" :types="types" :channels="channels" @add="handleAdd" @update="handleUpdate"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import { allChannel } from '@/api/user-center/channel';
import { addExtraField, allExtraFieldTypes, deleteExtraField, pageExtraField, updateExtraField } from '@/api/user-center/extra-field';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';
import { PageExtraFieldReq, ExtraField, ExtraFieldType } from '@/api/user-center/types/extra-field';
import { Channel } from '@/api/user-center/types/channel';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const formRef = ref();
const form = ref<ExtraField>({} as ExtraField);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const channels = ref<Channel[]>([]);
const types = ref<ExtraFieldType[]>([]);
const searchForm = ref<PageExtraFieldReq>({
	page: 1,
	page_size: 10
});
const columns = ref<TableCloumn[]>([
	{
		title: '字段名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '字段标识',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '字段类型',
		dataIndex: 'type',
		slotName: 'type'
	},
	{
		title: '字段描述',
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

// handleGetChannel 处理查询渠道
const handleGetChannel = async () => {
	const { data } = await allChannel();
	channels.value = data.list;
};

const sortByQueryParams = (property) => {
	// 默认升序
	const asc = -1;
	return (value1, value2) => {
		const a = value1[property];
		const b = value2[property];
		// eslint-disable-next-line no-nested-ternary
		return a < b ? asc : a > b ? asc * -1 : 0;
	};
};

// handleGet 处理查询
const handleGetTypes = async () => {
	const { data } = await allExtraFieldTypes();
	data.list.sort(sortByQueryParams('name'));
	types.value = data.list;
};

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await pageExtraField(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGetTypes();
handleGetChannel();
handleGet();

// 处理新增
const handleAdd = async (data: ExtraField) => {
	await addExtraField(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: ExtraField) => {
	await updateExtraField(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteExtraField(id);
	handleGet();
	Message.success('删除成功');
};

// 处理查询
const handleSearch = async (req: PageExtraFieldReq) => {
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
	form.value = {} as ExtraField;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: ExtraField) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = {} as ExtraField;
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
	name: 'ManagerExtraField'
};
</script>
