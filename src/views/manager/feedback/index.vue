<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search :groups="groups" @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd" @show-group="showGroup = true"></Tool>
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
		</a-card>
		<a-modal v-model:visible="showGroup" title="反馈分类" width="580px" :body-style="{ padding: 0 }" :footer="false">
			<Group />
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { FeedbackCategory, Feedback, ListFeedbackRequest } from '@/api/manager/feedback/type';
import { ListFeedback } from '@/api/manager/feedback/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Search from './components/search.vue';
import Group from './components/group/index.vue';

const formRef = ref();
const form = ref<Feedback>({} as Feedback);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const groups = ref<FeedbackCategory[]>([]);
const total = ref(0);
const showGroup = ref(false);
const searchForm = ref<ListFeedbackRequest>({
	page: 1,
	pageSize: 10,
	order: 'desc',
	orderBy: 'created_at'
});

const columns = ref<TableColumn[]>([
	{
		title: '应用名称',
		dataIndex: 'app.name'
	},
	{
		title: '反馈分类',
		dataIndex: 'category.name'
	},
	{
		title: '反馈用户',
		slotName: 'user'
	},
	{
		title: '反馈标题',
		dataIndex: 'title',
		slotName: 'title'
	},
	{
		title: '当前状态',
		dataIndex: 'status',
		slotName: 'status'
	},
	{
		title: '反馈时间',
		slotName: 'createdAt'
	},
	{
		title: '处理时间',
		slotName: 'updatedAt'
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
		const { data } = await ListFeedback(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListFeedbackRequest) => {
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

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as Feedback;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (worker: Feedback) => {
	form.value = { ...worker };
	formRef.value.showUpdateDrawer();
};
</script>
