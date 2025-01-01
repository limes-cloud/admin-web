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
import { ListChannel } from '@/api/notify/channel/api';
import { Channel, ListChannelRequest } from '@/api/notify/channel/type';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const formRef = ref();
const form = ref<Channel>({} as Channel);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const searchForm = ref<ListChannelRequest>({
	page: 1,
	pageSize: 10
});
const total = ref(0);
const size = ref<TableSize>('medium');
const columns = ref<TableColumn[]>([
	{
		title: '渠道标识',
		dataIndex: 'keyword',
		slotName: 'keyword'
	},
	{
		title: '渠道名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '渠道ak',
		dataIndex: 'ak',
		slotName: 'ak'
	},
	{
		title: '渠道sk',
		dataIndex: 'sk',
		slotName: 'sk'
	},
	{
		title: '扩展信息',
		dataIndex: 'extra',
		slotName: 'extra'
	},
	{
		title: '渠道状态',
		dataIndex: 'status',
		slotName: 'status'
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
		const { data } = await ListChannel(searchForm.value);
		tableData.value = data.list;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListChannelRequest) => {
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
	form.value = {} as Channel;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Channel) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerChannel'
};
</script>
