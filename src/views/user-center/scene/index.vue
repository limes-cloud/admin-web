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
			></Table>
			<Form ref="formRef" :data="form" :agreements="agreements" @add="handleAdd" @update="handleUpdate"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import { addScene, deleteScene, pageScene, updateScene } from '@/api/user-center/scene';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';
import { PageSceneReq, Scene } from '@/api/user-center/types/scene';
import { pageAgreement } from '@/api/user-center/agreement';
import { Agreement } from '@/api/user-center/types/agreement';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const formRef = ref();
const form = ref<Scene>({} as Scene);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const agreements = ref<Agreement[]>([]);
const searchForm = ref<PageSceneReq>({
	page: 1,
	page_size: 10
});
const columns = ref<TableCloumn[]>([
	{
		title: '场景名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '场景标志',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '场景描述',
		dataIndex: 'description',
		slotName: 'description'
	},
	{
		title: '创建时间',
		slotName: 'createdAt'
	},
	{
		title: '更新时间',
		slotName: 'updatedAt'
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations'
	}
]);

// handleGet 处理查询
const handleChannel = async () => {
	const { data } = await pageAgreement({ page: 1, page_size: 50 });
	agreements.value = data.list;
};

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await pageScene(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};
handleChannel();
handleGet();

// 处理新增
const handleAdd = async (data: Scene) => {
	await addScene(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: Scene) => {
	await updateScene(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteScene(id);
	handleGet();
	Message.success('删除成功');
};

// 处理查询
const handleSearch = async (req: PageSceneReq) => {
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
	form.value = {} as Scene;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Scene) => {
	form.value = { ...data };
	const ids = data.agreements.map((obj) => obj.id);
	form.value.agreement_ids = ids;
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = {} as Scene;
	formRef.value.showAddDrawer();
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
	name: 'ManagerScene'
};
</script>
