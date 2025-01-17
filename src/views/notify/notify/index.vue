<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search :groups="groups" @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd" @show-category="showCategory = true"></Tool>
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
				@template="handleShowTemplate"
			></Table>
			<Form ref="formRef" :groups="groups" @refresh="handleGet"></Form>
		</a-card>
		<a-modal
			v-model:visible="showCategory"
			title="通知分组"
			:modal-style="{ width: '80%', maxWidth: '800px' }"
			:body-style="{ padding: 0 }"
			:footer="false"
		>
			<Category />
		</a-modal>
		<a-modal
			v-model:visible="showTpl"
			:modal-style="{ width: '80%', maxWidth: '900px' }"
			unmount-on-close
			title="通知模板配置"
			:body-style="{ padding: 0, height: 'calc(100% - 48px)' }"
			:footer="false"
		>
			<TPL :id="tplId" />
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { NotifyCategory, Notify, ListNotifyRequest } from '@/api/notify/notify/type';
import { ListNotify } from '@/api/notify/notify/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Category from './components/category/index.vue';
import TPL from './components/template/index.vue';

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const groups = ref<NotifyCategory[]>([]);
const total = ref(0);
const showCategory = ref(false);
const showTpl = ref(false);
const tplId = ref(0);
const searchForm = ref<ListNotifyRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '通知标识',
		dataIndex: 'keyword'
	},
	{
		title: '通知名称',
		dataIndex: 'name'
	},
	{
		title: '通知分组',
		slotName: 'category'
	},
	{
		title: '通知标题',
		dataIndex: 'title'
	},
	{
		title: '优先级',
		slotName: 'priority'
	},
	{
		title: '通知变量',
		slotName: 'variable'
	},
	{
		title: '通知描述',
		dataIndex: 'description'
	},
	{
		title: '通知状态',
		dataIndex: 'status',
		slotName: 'status'
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
		slotName: 'operations',
		fixed: 'right',
		width: 100
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListNotify(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListNotifyRequest) => {
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

const handleShowTemplate = (notify: Notify) => {
	tplId.value = notify.id;
	showTpl.value = true;
};

//  处理tool按钮新建
const handleToolAdd = () => {
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (notify: Notify) => {
	formRef.value.showUpdateDrawer(notify);
};
</script>
