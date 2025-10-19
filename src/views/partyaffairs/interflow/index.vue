<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search :classifies="classifies" @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" tool @refresh="handleGet" @add="handleToolAdd" @show-classify="showPerson = true" />
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
			<Form ref="formRef" :data="form" :classifies="classifies" @refresh="handleGet"></Form>
			<a-modal
				v-model:visible="showPerson"
				title="资料分组"
				:modal-style="{ height: '80%', width: '80%', maxWidth: '800px' }"
				:body-style="{ padding: 0 }"
				:footer="false"
				@close="handleGetPerson()"
			>
				<Person />
			</a-modal>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';

import { Interflow, InterflowPerson, ListInterflowRequest } from '@/api/partyaffairs/resource/type';
import { ListInterflow, GetInterflow, ListInterflowPerson } from '@/api/partyaffairs/resource/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';
import Person from './components/person/index.vue';

const formRef = ref();
const form = ref<Interflow>({} as Interflow);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const classifies = ref<InterflowPerson[]>([]);
const showPerson = ref(false);
const searchForm = ref<ListInterflowRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '资料标题',
		dataIndex: 'title'
	},
	{
		title: '资料分类',
		dataIndex: 'classify.name'
	},
	{
		title: '资料描述',
		dataIndex: 'description'
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
const handleGetPerson = async () => {
	const { data } = await ListInterflowPerson();
	classifies.value = data.list;
};

handleGetPerson();

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListInterflow(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};
handleGet();

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as Interflow;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (resource: Interflow) => {
	const { data } = await GetInterflow({ id: resource.id });
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理查询
const handleSearch = async (req: ListInterflowRequest) => {
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
	name: 'PartyaffairsInterflow'
};
</script>
