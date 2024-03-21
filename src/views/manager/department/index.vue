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
				@object="handleObject"
			></Table>
			<Form ref="formRef" :departments="tableData" :data="form" @add="handleAdd" @update="handleUpdate"></Form>
			<ObjectElem ref="objectRef"></ObjectElem>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableCloumn, TableSize } from '@/types/global';
import { addDepartment, deleteDepartment, getDepartmentTree, updateDepartment } from '@/api/manager/department';

import useLoading from '@/hooks/loading';
import { Department } from '@/api/manager/types/department';
import { Message } from '@arco-design/web-vue';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import ObjectElem from './components/object.vue';

const objectRef = ref();
const formRef = ref();
const form = ref<Department>({} as Department);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const columns = ref<TableCloumn[]>([
	{
		title: '部门标志',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '部门名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '部门描述',
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
		const { data } = await getDepartmentTree();
		tableData.value = data;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理新增
const handleAdd = async (data: Department) => {
	await addDepartment(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: Department) => {
	await updateDepartment(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteDepartment(id);
	handleGet();
	Message.success('删除成功');
};

const handleObject = async (id: number) => {
	objectRef.value.show(id);
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as Department;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Department) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = { parent_id: id } as Department;
	formRef.value.showAddDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerDepartment'
};
</script>
