<template>
	<div class="container">
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
			@add="handleTableAdd"
			@update="handleTableUpdate"
			@refresh="handleGet"
		></Table>
		<Form ref="formRef" :dictionary-id="id" :data="form" @refresh="handleGet"></Form>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { ListDictionaryValue } from '@/api/manager/dictionary/api';
import { DictionaryValue, ListDictionaryValueRequest } from '@/api/manager/dictionary/type';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const props = defineProps<{ id: number }>();
const formRef = ref();
const form = ref<DictionaryValue>({} as DictionaryValue);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<ListDictionaryValueRequest>({
	page: 1,
	pageSize: 10,
	dictionaryId: props.id
});

const columns = ref<TableColumn[]>([
	{
		title: '标签',
		dataIndex: 'label'
	},
	{
		title: '标识',
		dataIndex: 'value'
	},
	{
		title: '状态',
		slotName: 'status'
	},
	{
		title: '权重',
		dataIndex: 'weight'
	},
	{
		title: '扩展信息',
		dataIndex: 'extra'
	},
	{
		title: '描述',
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
		width: 200
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListDictionaryValue(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListDictionaryValueRequest) => {
	searchForm.value = {
		...searchForm.value,
		...req
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
	form.value = {} as DictionaryValue;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (data: DictionaryValue) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = { id } as DictionaryValue;
	formRef.value.showAddDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerDictionaryValue'
};
</script>
