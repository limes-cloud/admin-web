<template>
	<template v-if="entity.id">
		<div class="header-title mb-15">字段管理</div>
		<Header @search="handleSearch" @add="handleToolAdd" class="mb-15"></Header>
		<Table
			:columns="columns"
			:loading="loading"
			:data="tableData"
			:size="size"
			:total="total"
			:pagination="searchForm"
			@add="handleTableAdd"
			@update="handleTableUpdate"
			@refresh="handleGet"
		></Table>
		<Form ref="formRef" :entity-id="entity.id" :values="tableData" :data="form" @refresh="handleGet"></Form>
	</template>
	<template v-else>
		<div class="empty">
			<div class="empty-content">
				<svgIcon name="empty-data" :size="180" text="请选择应用" />
				请选择实体
			</div>
		</div>
	</template>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { ListEntityField } from '@/api/manager/entity/api';
import { Entity, EntityField, ListEntityFieldRequest } from '@/api/manager/entity/type';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Header from './components/header.vue';

const formRef = ref();
const form = ref<EntityField>({} as EntityField);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<EntityField[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const entity = ref<Entity>({ id: 0 } as Entity);

const searchForm = ref<ListEntityFieldRequest>({});

const columns = ref<TableColumn[]>([
	{
		title: '字段标识',
		dataIndex: 'name'
	},
	{
		title: '字段备注',
		dataIndex: 'comment'
	},
	{
		title: '操作',
		slotName: 'operations',
		fixed: 'right',
		width: 80
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		searchForm.value.entityId = entity.value.id;
		const { data } = await ListEntityField(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

// 处理查询
const handleSearch = async (req: ListEntityFieldRequest) => {
	searchForm.value = {
		...searchForm.value,
		...req
	};

	handleGet();
};

//  处理tool按钮新建
const handleToolAdd = (pid: number) => {
	form.value = {} as EntityField;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (data: EntityField) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = {} as EntityField;
	formRef.value.showAddDrawer();
};

const show = (dict: Entity) => {
	entity.value = dict;
	handleGet();
};

defineExpose({ show });
</script>

<script lang="ts">
export default {
	name: 'ManagerEntityField'
};
</script>
<style lang="less" scoped>
.empty {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	.empty-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
}
</style>
