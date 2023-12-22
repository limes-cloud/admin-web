<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd"></Tool>
			<Table
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				@add="handleTableAdd"
				@update="handleTableUpdate"
				@delete="handleDelete"
				@query-token="handleQueryToken"
				@reset-token="handleResetToken"
			></Table>
			<Form ref="formRef" :data="form" @add="handleAdd" @update="handleUpdate"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableCloumn, TableSize } from '@/types/global';
import { addEnv, deleteEnv, allEnv, updateEnv, resetEnvToken, queryEnvToken } from '@/api/configure/env';
import useLoading from '@/hooks/loading';
import { Message, Modal } from '@arco-design/web-vue';
import { Env } from '@/api/configure/types/env';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';

const formRef = ref();
const form = ref<Env>({} as Env);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const columns = ref<TableCloumn[]>([
	{
		title: '环境标志',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '环境名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '环境状态',
		dataIndex: 'status',
		slotName: 'status'
	},
	{
		title: '环境描述',
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

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await allEnv();
		tableData.value = data;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理新增
const handleAdd = async (data: Env) => {
	await addEnv(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: Env) => {
	await updateEnv(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteEnv(id);
	handleGet();
	Message.success('删除成功');
};

const handleQueryToken = async (id: number) => {
	const { data } = await queryEnvToken(id);
	Modal.success({
		title: '获取Toekn成功',
		content: `当前环境的token为${data.token}`
	});
};

const handleResetToken = async (id: number) => {
	const { data } = await resetEnvToken(id);
	Modal.success({
		title: '重置Toekn成功',
		content: `当前环境的token为${data.token}`
	});
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as Env;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Env) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = {} as Env;
	formRef.value.showAddDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerEnv'
};
</script>
