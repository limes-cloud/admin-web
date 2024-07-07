<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet"></Tool>
			<Table
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				:total="total"
				:pagination="{
					page: searchForm.page,
					pageSize: searchForm.page_size
				}"
				@page-change="handlePageChange"
				@delete="handleDelete"
			></Table>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';
import { pageNewsComment, deleteNewsComment } from '@/api/partyaffairs/news';

import { PageNewsCommentReq } from '@/api/partyaffairs/types/news';
import router from '@/router';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Search from './components/search.vue';

const params = router.currentRoute.value.query;
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);

const searchForm = ref<PageNewsCommentReq>({
	page: 1,
	page_size: 10,
	content_id: Number(params.id)
});

const columns = ref<TableColumn[]>([
	{
		title: '评论者姓名',
		slotName: 'name'
	},
	{
		title: '评论者昵称',
		slotName: 'nick'
	},
	{
		title: '评论内容',
		dataIndex: 'text',
		slotName: 'text'
	},
	{
		title: '评论时间',
		dataIndex: 'created_at',
		slotName: 'createdAt'
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations',
		fixed: 'right',
		width: 100
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await pageNewsComment(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: PageNewsCommentReq) => {
	const pageSize = searchForm.value.page_size;
	searchForm.value = {
		...req,
		page: 1,
		page_size: pageSize,
		content_id: Number(params.id)
	};

	handleGet();
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.page;
	searchForm.value.page_size = page.pageSize;
	handleGet();
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteNewsComment(id);
	handleGet();
	Message.success('删除成功');
};
</script>
