<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @search="handleSearch" @select="handleSearchSelect"></Search>
			<Tool v-model:size="size" v-model:columns="columns" :enable-create="!!searchForm.server_id" @refresh="handleGet" @add="handleToolAdd"></Tool>
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
			<Value ref="valueRef" :type="current.type" :values="values" :envs="envs" @update="handleUpdateValue"></Value>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import { addBusiness, deleteBusiness, pageBusiness, updateBusiness, getBusinessValues, updateBusinessValues } from '@/api/configure/business';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';
import { PageBusinessReq, Business, BusinessValue } from '@/api/configure/types/business';
import { Server } from '@/api/configure/types/server';
import { allEnv } from '@/api/configure/env';
import { Env } from '@/api/configure/types/env';

import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Value from './components/value.vue';

const formRef = ref();
const valueRef = ref();

const form = ref<Business>({} as Business);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const servers = ref<Server[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const envs = ref<Env[]>([]);
const values = ref<BusinessValue[]>([]);
const current = ref<Business>({ type: '' } as Business);
const searchForm = ref<PageBusinessReq>({
	page: 1,
	page_size: 10,
	server_id: 0
});
const columns = ref<TableCloumn[]>([
	{
		title: '变量标志',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '变量类型',
		dataIndex: 'type',
		slotName: 'type'
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

// handleGetBusinessEnvs 查询所有的环境
const handleGetBusinessEnvs = async () => {
	const { data } = await allEnv();
	envs.value = data.list;
};

// handleGet 处理查询指定变量的所有值
const handleGetBusinessValues = async (id: number) => {
	const { data } = await getBusinessValues(id);
	values.value = data.list;
};

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await pageBusiness(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGetBusinessEnvs();

// 处理新增
const handleAdd = async (data: Business) => {
	await addBusiness(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: Business) => {
	await updateBusiness(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteBusiness(id);
	handleGet();
	Message.success('删除成功');
};

// 处理查询
const handleSearch = async (req: PageBusinessReq) => {
	const pageSize = searchForm.value.page_size;
	searchForm.value = {
		...req,
		page: 1,
		page_size: pageSize
	};
	handleGet();
};

const handleUpdateValue = async (data: BusinessValue[]) => {
	await updateBusinessValues(current.value?.id, data);
	Message.success('配置成功');
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = { server_id: searchForm.value.server_id } as Business;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Business) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = {} as Business;
	formRef.value.showAddDrawer();
};

// handleTableSet 处理点击值配置
const handleTableSet = (data: Business) => {
	current.value = data;
	handleGetBusinessValues(data.id);
	valueRef.value.showUpdateDrawer();
};

const handleSearchSelect = (id: number) => {
	searchForm.value.server_id = id;
	handleGet();
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
	name: 'ConfigureBusiness'
};
</script>
