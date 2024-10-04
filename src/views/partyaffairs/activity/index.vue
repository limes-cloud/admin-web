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
				:pagination="searchForm"
				@page-change="handlePageChange"
				@update="handleTableUpdate"
				@refresh="handleGet"
			></Table>
			<Form ref="formRef" :data="form" @refresh="handleGet"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { Activity, ListActivityRequest } from '@/api/partyaffairs/activity/type';
import { ListActivity, GetActivity } from '@/api/partyaffairs/activity/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const formRef = ref();
const form = ref<Activity>({} as Activity);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListActivityRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '活动标题',
		dataIndex: 'title'
	},
	{
		title: '活动封面',
		slotName: 'cover'
	},
	{
		title: '发布单位',
		dataIndex: 'unit'
	},
	{
		title: '是否置顶',
		slotName: 'isTop'
	},
	{
		title: '活动状态',
		slotName: 'status'
	},
	{
		title: '阅读人数',
		dataIndex: 'read'
	},
	{
		title: '创建时间',
		slotName: 'createdAt',
		width: 170
	},
	{
		title: '更新时间',
		slotName: 'updatedAt',
		width: 170
	},
	{
		title: '操作',
		slotName: 'operations',
		fixed: 'right',
		width: 150
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListActivity(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = { isTop: false, status: false } as Activity;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (activity: Activity) => {
	const { data } = await GetActivity({ id: activity.id });
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理查询
const handleSearch = async (req: ListActivityRequest) => {
	const { pageSize } = searchForm.value;
	searchForm.value = {
		...req,
		page: 1,
		pageSize
	};

	handleGet();
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.page;
	searchForm.value.pageSize = page.pageSize;
	handleGet();
};
</script>

<script lang="ts">
export default {
	name: 'PartyaffairsActivity'
};
</script>
