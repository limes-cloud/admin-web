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
			:pagination="{
				current: searchForm.page,
				pageSize: searchForm.page_size
			}"
			@page-change="handlePageChange"
			@add="handleTableAdd"
			@update="handleTableUpdate"
			@delete="handleDelete"
		></Table>
		<Form ref="formRef" :data="form" @add="handleAdd" @update="handleUpdate"></Form>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';

import router from '@/router';
import { addDictionaryValue, deleteDictionaryValue, pageDictionaryValue, updateDictionaryValue } from '@/api/manager/dictionary';
import { DictionaryValue, PageDictionaryValueReq } from '@/api/manager/types/dictionary';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const props = defineProps<{ id: number }>();
const params = router.currentRoute.value.query;
const formRef = ref();
const form = ref<DictionaryValue>({} as DictionaryValue);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<PageDictionaryValueReq>({
	page: 1,
	page_size: 10,
	dictionary_id: props.id
});

const columns = ref<TableCloumn[]>([
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
		dataIndex: 'created_at',
		slotName: 'createdAt',
		width: 170
	},
	{
		title: '更新时间',
		dataIndex: 'updated_at',
		slotName: 'updatedAt',
		width: 170
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations',
		fixed: 'right',
		width: 200
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await pageDictionaryValue(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: PageDictionaryValueReq) => {
	searchForm.value = {
		...searchForm.value,
		...req
	};

	handleGet();
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.current;
	searchForm.value.page_size = page.pageSize;
	handleGet();
};

// 处理新增
const handleAdd = async (data: DictionaryValue) => {
	data.dictionary_id = params.dictionary_id as unknown as number;
	await addDictionaryValue(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: DictionaryValue) => {
	await updateDictionaryValue(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteDictionaryValue(id);
	handleGet();
	Message.success('删除成功');
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
