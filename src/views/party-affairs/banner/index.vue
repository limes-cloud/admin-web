<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd"></Tool>
			<Table :columns="columns" :loading="loading" :data="tableData" @add="handleTableAdd" @update="handleTableUpdate" @delete="handleDelete"></Table>
			<Form ref="formRef" :roles="roles" :data="form" @add="handleAdd" @update="handleUpdate"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableCloumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';
import { Role } from '@/api/manager/types/role';
import { allBanner, addBanner, deleteBanner, updateBanner } from '@/api/party-affairs/banner';
import { Banner } from '@/api/party-affairs/types/banner';

import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';

const formRef = ref();
const form = ref<Banner>({} as Banner);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const roles = ref<Role>({} as Role);

const columns = ref<TableCloumn[]>([
	{
		title: '轮播标题',
		dataIndex: 'title'
	},
	{
		title: '轮播图',
		dataIndex: 'src',
		slotName: 'src'
	},
	{
		title: '是否跳转',
		dataIndex: 'jump',
		slotName: 'jump'
	},
	{
		title: '跳转信息',
		dataIndex: 'jumpInfo',
		slotName: 'jumpInfo'
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
		width: 150
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await allBanner();
		tableData.value = data.list;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理新增
const handleAdd = async (data: Banner) => {
	await addBanner(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: Banner) => {
	await updateBanner(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteBanner(id);
	handleGet();
	Message.success('删除成功');
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as Banner;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (data: Banner) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = { id } as Banner;
	formRef.value.showAddDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerBanner'
};
</script>
