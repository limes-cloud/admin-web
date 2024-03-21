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
			></Table>
			<Form ref="formRef" :menus="tableData" :objects="objects" :data="form" @add="handleAdd" @update="handleUpdate"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableCloumn, TableSize } from '@/types/global';
import { addMenu, deleteMenu, getMenuTree, updateMenu } from '@/api/manager/menu';
import useLoading from '@/hooks/loading';
import { Menu } from '@/api/manager/types/menu';
import { Message } from '@arco-design/web-vue';
import { pageObject } from '@/api/manager/object';
import { ObjectDef } from '@/api/manager/types/object';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';

const formRef = ref();
const form = ref<Menu>({} as Menu);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const objects = ref<ObjectDef[]>([]);
const columns = ref<TableCloumn[]>([
	{
		title: '菜单标题',
		dataIndex: 'locale',
		slotName: 'title'
	},
	{
		title: '菜单路由',
		dataIndex: 'path',
		slotName: 'path'
	},
	{
		title: '菜单类型',
		dataIndex: 'type',
		slotName: 'type'
	},
	{
		title: '是否隐藏',
		dataIndex: 'is_hidden',
		slotName: 'isHidden'
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
		const { data } = await getMenuTree();
		tableData.value = data.list;
	} finally {
		setLoading(false);
	}
};

const handleGetObject = async (val?: string) => {
	const { data } = await pageObject({ page: 1, page_size: 50 });
	objects.value = data.list;
};

handleGet();
handleGetObject();
// 处理新增
const handleAdd = async (data: Menu) => {
	if (data.type === 'R') {
		data.app = data.keyword;
		data.component = 'Layout';
		data.path = `/${data.app.toLocaleLowerCase()}`;
	}
	await addMenu(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: Menu) => {
	await updateMenu(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteMenu(id);
	handleGet();
	Message.success('删除成功');
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as Menu;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Menu) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

const handleTableAdd = (data: Menu) => {
	form.value = { parent_id: data.id, app: data.app } as Menu;
	formRef.value.showAddDrawer();
};

// 处理
</script>

<script lang="ts">
export default {
	name: 'ManagerMenu'
};
</script>
