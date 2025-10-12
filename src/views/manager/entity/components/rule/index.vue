<template>
	<template v-if="entity.id">
		<div class="header-title mb-15">规则管理</div>
		<Header @search="handleSearch" @add="handleToolAdd" class="mb-15"></Header>
		<Table :columns="columns" :loading="loading" :data="tableData" :size="size" :total="total" @update="handleTableUpdate" @refresh="handleGet"></Table>
		<Form ref="formRef" :entity-id="entity.id" :values="tableData" @refresh="handleGet"></Form>
	</template>
	<template v-else>
		<div class="empty">
			<div class="empty-content">
				<svgIcon name="empty-data" :size="180" />
				请选择实体
			</div>
		</div>
	</template>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { ListEntityRule } from '@/api/manager/entity/api';
import { Entity, EntityRule, ListEntityRuleRequest } from '@/api/manager/entity/type';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Header from './components/header.vue';

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<EntityRule[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const entity = ref<Entity>({ id: 0 } as Entity);
const searchForm = ref<ListEntityRuleRequest>({});
const columns = ref<TableColumn[]>([
	{
		title: '规则标识',
		dataIndex: 'name'
	},
	{
		title: '规则备注',
		dataIndex: 'description'
	},
	{
		title: '操作',
		slotName: 'operations',
		fixed: 'right'
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		searchForm.value.entityId = entity.value.id;
		const { data } = await ListEntityRule(searchForm.value);
		tableData.value = data.list;
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

// 处理查询
const handleSearch = async (req: ListEntityRuleRequest) => {
	searchForm.value = {
		...searchForm.value,
		...req
	};

	handleGet();
};

//  处理tool按钮新建
const handleToolAdd = () => {
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (data: EntityRule) => {
	formRef.value.showUpdateDrawer(data);
};

const show = (val: Entity) => {
	entity.value = val;
	handleGet();
};

defineExpose({ show });
</script>

<script lang="ts">
export default {
	name: 'ManagerEntityRule'
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
