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
			<Form ref="formRef" :data="form" :extra-fields="extraFields" :channels="channels" @add="handleAdd" @update="handleUpdate"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';

import { addVideoClassify, deleteVideoClassify, pageVideoClassify, updateVideoClassify } from '@/api/party-affairs/video';
import { PageVideoClassifyReq, VideoClassify } from '@/api/party-affairs/types/video';
import { Field } from '@/api/user-center/types/field';
import { Channel } from '@/api/user-center/types/user';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const formRef = ref();
const form = ref<VideoClassify>({} as VideoClassify);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const channels = ref<Channel[]>([]);
const extraFields = ref<Field[]>([]);
const searchForm = ref<PageVideoClassifyReq>({
	page: 1,
	page_size: 10
});

const columns = ref<TableCloumn[]>([
	{
		title: '分类名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '分类权重',
		dataIndex: 'weight',
		slotName: 'weight'
	},
	{
		title: '分类封面',
		slotName: 'cover'
	},
	{
		title: '分类描述',
		dataIndex: 'desc',
		slotName: 'desc'
	},
	{
		title: '是否置顶',
		dataIndex: 'is_top',
		slotName: 'isTop'
	},
	{
		title: '是否任务',
		dataIndex: 'is_task',
		slotName: 'isTask'
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
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await pageVideoClassify(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理新增
const handleAdd = async (data: VideoClassify) => {
	await addVideoClassify(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: VideoClassify) => {
	await updateVideoClassify(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteVideoClassify(id);
	handleGet();
	Message.success('删除成功');
};

// 处理查询
const handleSearch = async (req: PageVideoClassifyReq) => {
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
	form.value = {} as VideoClassify;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: VideoClassify) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = {} as VideoClassify;
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
	name: 'ManagerVideoClassify'
};
</script>
