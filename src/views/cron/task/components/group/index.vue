<template>
	<div class="container" :style="{ padding: 0 }">
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
import { TaskGroup } from '@/api/cron/types/task';
import { allTaskGroup, addTaskGroup, deleteTaskGroup, updateTaskGroup } from '@/api/cron/task';

import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';

const formRef = ref();
const form = ref<TaskGroup>({} as TaskGroup);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const roles = ref<Role>({} as Role);

const columns = ref<TableCloumn[]>([
	{
		title: '分组名称',
		dataIndex: 'name'
	},
	{
		title: '分组描述',
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
		width: 150
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await allTaskGroup();
		tableData.value = data.list;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理新增
const handleAdd = async (data: TaskGroup) => {
	await addTaskGroup(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: TaskGroup) => {
	await updateTaskGroup(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteTaskGroup(id);
	handleGet();
	Message.success('删除成功');
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as TaskGroup;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (data: TaskGroup) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = { id } as TaskGroup;
	formRef.value.showAddDrawer();
};
</script>
