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
				@preview="handlePreview"
			></Table>
			<Form ref="formRef" :data="form" :menus="menus" @add="handleAdd" @update="handleUpdate"></Form>
			<Preview ref="previewRef"></Preview>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';

import { pageObject, addObject, deleteObject, updateObject, loadObjectValue } from '@/api/manager/object';
import { PageObjectReq, ObjectDef } from '@/api/manager/types/object';
import { getMenuFromRole } from '@/api/manager/menu';
import { Menu } from '@/api/manager/types/menu';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Preview from './components/preview.vue';

const previewRef = ref();
const formRef = ref();
const form = ref<ObjectDef>({} as ObjectDef);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<PageObjectReq>({
	page: 1,
	page_size: 10
});
const menus = ref<Menu[]>([]);

const columns = ref<TableCloumn[]>([
	{
		title: '字典名称',
		dataIndex: 'name'
	},
	{
		title: '字典关键词',
		dataIndex: 'keyword'
	},
	{
		title: '字典类型',
		dataIndex: 'type',
		slotName: 'type'
	},
	{
		title: '字典描述',
		dataIndex: 'description'
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
		width: 200
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await pageObject(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

const handleGetMenu = async () => {
	const { data } = await getMenuFromRole();
	menus.value = data.list;
};

handleGet();
handleGetMenu();

// 处理查询
const handleSearch = async (req: PageObjectReq) => {
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
const handleAdd = async (data: ObjectDef) => {
	await addObject(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: ObjectDef) => {
	await updateObject(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteObject(id);
	handleGet();
	Message.success('删除成功');
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as ObjectDef;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (data: ObjectDef) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = { id } as ObjectDef;
	formRef.value.showAddDrawer();
};

const handlePreview = async (data: ObjectDef) => {
	const res = await loadObjectValue(data);
	previewRef.value.show(res);
};
</script>

<script lang="ts">
export default {
	name: 'ManagerObject'
};
</script>
