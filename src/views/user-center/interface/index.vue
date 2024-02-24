<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @select="handleSearchSelect"></Search>
			<Tool v-model:size="size" v-model:columns="columns" :enable-create="!!currentAppId" @refresh="handleGet" @add="handleToolAdd"></Tool>
			<Table
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				@add="handleTableAdd"
				@update="handleTableUpdate"
				@delete="handleDelete"
			></Table>
			<Form ref="formRef" :interfaces="tableData" :data="form" @add="handleAdd" @update="handleUpdate"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableCloumn, TableSize } from '@/types/global';
import { addAppInterface, deleteAppInterface, getAppInterfaceTree, updateAppInterface } from '@/api/user-center/app-interface';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';
import { AppInterface } from '@/api/user-center/types/app-interface';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Search from './components/search.vue';
import Form from './components/form.vue';

const formRef = ref();
const form = ref<AppInterface>({} as AppInterface);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const currentAppId = ref(0);

const columns = ref<TableCloumn[]>([
	{
		title: '菜单标题',
		dataIndex: 'title'
	},
	{
		title: '菜单路由',
		dataIndex: 'path'
	},
	{
		title: '菜单类型',
		dataIndex: 'type',
		slotName: 'type'
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
		const { data } = await getAppInterfaceTree(currentAppId.value);
		tableData.value = data.list;
	} finally {
		setLoading(false);
	}
};

// 处理新增
const handleAdd = async (data: AppInterface) => {
	data.app_id = currentAppId.value;
	await addAppInterface(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: AppInterface) => {
	data.app_id = currentAppId.value;
	await updateAppInterface(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteAppInterface(id);
	handleGet();
	Message.success('删除成功');
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as AppInterface;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: AppInterface) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

const handleTableAdd = (data: AppInterface) => {
	form.value = { parent_id: data.id } as AppInterface;
	formRef.value.showAddDrawer();
};

const handleSearchSelect = (id: number) => {
	currentAppId.value = id;

	handleGet();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerAppInterface'
};
</script>
