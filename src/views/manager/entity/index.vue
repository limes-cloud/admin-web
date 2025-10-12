<template>
	<div class="container">
		<Breadcrumb />
		<div class="flex-card">
			<div class="general-card left">
				<div class="header-title mb-15">实体管理</div>
				<Header @search="handleSearch" @add="handleAdd" @load="handleLoad"></Header>
				<EntityEle
					:data="list"
					:total="total"
					:pagination="searchForm"
					@page-change="handlePageChange"
					@update="handleTableUpdate"
					@value="handleTableField"
					@refresh="handleGet"
				></EntityEle>
				<Form ref="formRef" :data="form" @refresh="handleGet"></Form>
			</div>
			<div class="general-card field mr-15">
				<Field ref="fieldRef"></Field>
			</div>
			<div class="general-card right">
				<Rule ref="ruleRef"></Rule>
			</div>
		</div>
		<Import ref="importRef" @refresh="handleGet" />
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Pagination } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Modal } from '@arco-design/web-vue';
import { Entity, ListEntityRequest } from '@/api/manager/entity/type';
import { ListEntity, LoadEntity } from '@/api/manager/entity/api';
import { GetApp } from '@/api/manager/app/api';
import { App } from '@/api/manager/app/type';

import EntityEle from './components/entity.vue';
import Form from './components/form.vue';
import Import from './components/import.vue';
import Header from './components/header.vue';
import Field from './components/field/index.vue';
import Rule from './components/rule/index.vue';

const app = ref<App>();
const appId = ref(0);
const router = useRouter();

const importRef = ref();
const ruleRef = ref();
const fieldRef = ref();
const formRef = ref();
const form = ref<Entity>({} as Entity);
const { setLoading } = useLoading(true);
const list = ref<Entity[]>([]);
const total = ref(0);
const searchForm = ref<ListEntityRequest>({
	page: 1,
	pageSize: 10
});

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		searchForm.value.appId = appId.value;
		const { data } = await ListEntity(searchForm.value);
		list.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

// handleGet 处理查询
const handleGetApp = async () => {
	const { data } = await GetApp({ id: appId.value });
	app.value = data;
};

// 处理查询
const handleSearch = async (req: ListEntityRequest) => {
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
	form.value = {} as Entity;
	formRef.value.showAddDrawer();
};

const handleTableField = (ent: Entity) => {
	fieldRef.value.show(ent);
	ruleRef.value.show(ent);
};

// 处理table点击更新
const handleTableUpdate = async (data: Entity) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

const handleLoad = () => {
	Modal.info({
		title: '数据载入提示',
		content: () => `您确认要载入应用实体数据么？载入不会影响增量数据，相同字段会同步更新`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			console.log(app.value?.keyword);
			const { data } = await LoadEntity({ app: app.value?.keyword as string });

			importRef.value.show(app.value?.id, data.list);
			// await UpdateUserStatus({ id: record.id, status: record.status as boolean });
			// Message.success(`${status}成功`);
		}
	});
};

onMounted(() => {
	const aid = router.currentRoute.value.query.appId;
	appId.value = Number(aid) as unknown as number;
	handleGet();
	handleGetApp();
});
</script>

<script lang="ts">
export default {
	name: 'ManagerEntity'
};
</script>

<style lang="less" scoped>
.flex-card {
	display: flex;
	height: 100%;

	.left {
		width: 260px;
		min-width: 260px;
		max-width: 260px;
		margin-right: 15px;
	}

	.field {
		width: 320px;
		min-width: 320px;
		max-width: 320px;
	}

	.right {
		flex: 1;
	}
}
</style>
