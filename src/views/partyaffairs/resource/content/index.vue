<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search :classifys="classifys" @search="handleSearch"></Search>
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
			<Form ref="formRef" :data="form" :classifys="classifys" @add="handleAdd" @update="handleUpdate"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';
import { pageResource, getResource, addResource, deleteResource, updateResource } from '@/api/partyaffairs/resource';
import { allResourceClassify } from '@/api/partyaffairs/resource_classify';
import { ResourceClassify } from '@/api/partyaffairs/types/resource_classify';
import { PageResourceReq, Resource } from '@/api/partyaffairs/types/resource';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const formRef = ref();
const form = ref<Resource>({} as Resource);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const classifys = ref<ResourceClassify[]>([]);
const total = ref(0);
const searchForm = ref<PageResourceReq>({
	page: 1,
	page_size: 10
});

const columns = ref<TableCloumn[]>([
	{
		title: '资料标题',
		dataIndex: 'title'
	},
	{
		title: '资料描述',
		dataIndex: 'desc'
	},
	{
		title: '下载数量',
		dataIndex: 'download_count'
	},
	{
		title: '所属分类',
		dataIndex: 'classify_id',
		slotName: 'classify'
	},
	{
		title: '创建时间',
		dataIndex: 'created_at',
		slotName: 'createdAt'
	},
	{
		title: '更新时间',
		dataIndex: 'updated_at',
		slotName: 'updatedAt'
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations',
		fixed: 'right',
		width: 100
	}
]);

const handleGetClassifys = async () => {
	const { data } = await allResourceClassify();
	classifys.value = data;
};

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await pageResource(searchForm.value);
		tableData.value = data.list as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();
handleGetClassifys();

// 处理查询
const handleSearch = async (req: PageResourceReq) => {
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
const handleAdd = async (data: Resource) => {
	await addResource(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: Resource) => {
	await updateResource(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteResource(id);
	handleGet();
	Message.success('删除成功');
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as Resource;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (resource: Resource) => {
	const { data } = await getResource(resource.id);
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = { id } as Resource;
	formRef.value.showAddDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerResource'
};
</script>
