<template>
	<div class="container">
		<div class="general-card">
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
			<Form ref="formRef" :app-id="appId" @refresh="handleGet"></Form>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { AppOAuthChannel, ListAppOAuthChannelRequest } from '@/api/manager/app/type';
import { ListAppOAuthChannel } from '@/api/manager/app/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const props = defineProps<{ appId: number }>();

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListAppOAuthChannelRequest>({
	appId: props.appId,
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '渠道图标',
		slotName: 'logo'
	},
	{
		title: '渠道名称',
		dataIndex: 'channel.name'
	},
	{
		title: '渠道标识',
		dataIndex: 'channel.keyword'
	},
	{
		title: '创建时间',
		slotName: 'createdAt'
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
		const { data } = await ListAppOAuthChannel(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

onMounted(() => {
	handleGet();
});

// 处理查询
const handleSearch = async (req: ListAppOAuthChannelRequest) => {
	const { appId, pageSize } = searchForm.value;
	searchForm.value = {
		...req,
		appId,
		page: 1,
		pageSize
	};
	handleGet();
};

//  处理tool按钮新建
const handleToolAdd = () => {
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: AppOAuthChannel) => {
	formRef.value.showUpdateDrawer(data);
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
	name: 'ManagerAppOAuthChannel'
};
</script>
