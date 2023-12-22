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
				@add="handleTableAdd"
				@update="handleTableUpdate"
				@delete="handleDelete"
			></Table>
			<Form ref="formRef" :data="form" @add="handleAdd" @update="handleUpdate"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableCloumn, TableSize } from '@/types/global';
import { addServer, deleteServer, pageServer, updateServer } from '@/api/configure/server';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';
import { PageServerReq, Server } from '@/api/configure/types/server';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const formRef = ref();
const form = ref<Server>({} as Server);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<PageServerReq>({
	page: 1,
	page_size: 10
});
const columns = ref<TableCloumn[]>([
	{
		title: '服务标志',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '服务名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '服务描述',
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
		const { data } = await pageServer(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理新增
const handleAdd = async (data: Server) => {
	await addServer(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: Server) => {
	await updateServer(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteServer(id);
	handleGet();
	Message.success('删除成功');
};

// 处理查询
const handleSearch = async (req: PageServerReq) => {
	const pageSize = searchForm.value.page_size;
	searchForm.value = {
		...req,
		page: 1,
		page_size: pageSize
	};
	handleGet();
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as Server;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Server) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = {} as Server;
	formRef.value.showAddDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerServer'
};
</script>
