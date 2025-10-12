<template>
	<div class="container">
		<Breadcrumb />
		<div class="flex-card">
			<div class="general-card left">
				<Header @search="handleSearch" @add="handleAdd"></Header>
				<Menu
					:data="list"
					:total="total"
					:pagination="searchForm"
					@page-change="handlePageChange"
					@update="handleTableUpdate"
					@value="handleTableValue"
					@refresh="handleGet"
				></Menu>
				<Form ref="formRef" :data="form" @refresh="handleGet"></Form>
			</div>
			<div class="general-card right">
				<Value ref="valueRef"></Value>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Pagination } from '@/types/global';
import useLoading from '@/hooks/loading';

import { Dictionary, ListDictionaryRequest } from '@/api/manager/dictionary/type';
import { ListDictionary } from '@/api/manager/dictionary/api';
import Menu from './components/menu.vue';
import Form from './components/form.vue';
import Header from './components/header.vue';
import Value from './components/value/index.vue';

const valueRef = ref();
const formRef = ref();
const form = ref<Dictionary>({} as Dictionary);
const { setLoading } = useLoading(true);
const list = ref<Dictionary[]>([]);
const total = ref(0);
const searchForm = ref<ListDictionaryRequest>({
	page: 1,
	pageSize: 10
});
const currentId = ref<number | null>(null);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListDictionary(searchForm.value);
		list.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

handleGet();

// 处理查询
const handleSearch = async (req: ListDictionaryRequest) => {
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
const handleAdd = () => {
	form.value = {} as Dictionary;
	formRef.value.showAddDrawer();
};

const handleTableValue = (dict: Dictionary) => {
	valueRef.value.show(dict);
};

// 处理table点击更新
const handleTableUpdate = async (data: Dictionary) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerDictionary'
};
</script>

<style lang="less" scoped>
.flex-card {
	height: 100%;
	display: flex;
	.left {
		width: 220px;
		min-width: 220px;
		max-width: 220px;
		margin-right: 15px;
	}
	.right {
		flex: 1;
	}
}
</style>
