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
				@set="handleTableSet"
			></Table>
			<Form ref="formRef" :data="form" :servers="servers" @add="handleAdd" @update="handleUpdate"></Form>
			<Value ref="valueRef" :values="values" :envs="envs" @update="handleUpdateValue"></Value>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import { addResource, deleteResource, pageResource, updateResource, getResourceValues, updateResourceValue } from '@/api/configure/resource';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';
import { PageResourceReq, Resource, ResourceValue } from '@/api/configure/types/resource';
import { Server } from '@/api/configure/types/server';
import { allEnv } from '@/api/configure/env';
import { Env } from '@/api/configure/types/env';
import { pageServer } from '@/api/configure/server';

import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Value from './components/value.vue';

const formRef = ref();
const valueRef = ref();

const form = ref<Resource>({} as Resource);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const servers = ref<Server[]>([]);
const size = ref<TableSize>('medium');
const total = ref(0);
const envs = ref<Env[]>([]);
const values = ref<ResourceValue[]>([]);
const current = ref<number>(0);
const searchForm = ref<PageResourceReq>({
	page: 1,
	page_size: 10
});
const columns = ref<TableCloumn[]>([
	{
		title: '变量标志',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '变量字段',
		dataIndex: 'fields',
		slotName: 'fields'
	},
	{
		title: '变量标签',
		dataIndex: 'tag',
		slotName: 'tag'
	},
	{
		title: '变量描述',
		dataIndex: 'description',
		slotName: 'description'
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
		slotName: 'operations'
	}
]);

// handleGetResourceServers 查询指定资源的所属服务
const handleGetResourceServers = async () => {
	const { data } = await pageServer({ page: 1, page_size: 50 });
	servers.value = data.list;
};

// handleGetResourceEnvs 查询所有的环境
const handleGetResourceEnvs = async () => {
	const { data } = await allEnv();
	envs.value = data.list;
};

// handleGet 处理查询指定资源的所有值
const handleGetResourceValues = async (id: number) => {
	const { data } = await getResourceValues(id);
	values.value = data.list;
};

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await pageResource(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();
handleGetResourceEnvs();
handleGetResourceServers();

// 处理新增
const handleAdd = async (data: Resource) => {
	data.fields = data.fieldList.join(',');
	await addResource(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: Resource) => {
	data.fields = data.fieldList.join(',');
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

const handleUpdateValue = async (data: ResourceValue[]) => {
	await updateResourceValue(current.value, data);
	Message.success('配置成功');
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as Resource;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Resource) => {
	form.value = { ...data };
	form.value.fieldList = form.value.fields.split(',');
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = {} as Resource;
	formRef.value.showAddDrawer();
};

// handleTableSet 处理点击值配置
const handleTableSet = (id: number) => {
	current.value = id;
	handleGetResourceValues(id);
	valueRef.value.showUpdateDrawer();
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
	name: 'ConfigureResource'
};
</script>
