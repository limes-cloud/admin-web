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

import { Information, ListInformationRequest } from '@/api/poverty/information/type';
import { ListInformation, GetInformation } from '@/api/poverty/information/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const formRef = ref();
const form = ref<Information>({} as Information);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListInformationRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '资讯标题',
		dataIndex: 'title'
	},
	{
		title: '资讯封面',
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
		title: '资讯状态',
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
		const { data } = await ListInformation(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = { isTop: false, status: false } as Information;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (information: Information) => {
	const { data } = await GetInformation({ id: information.id });
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理查询
const handleSearch = async (req: ListInformationRequest) => {
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
	name: 'PovertyInformation'
};
</script>
