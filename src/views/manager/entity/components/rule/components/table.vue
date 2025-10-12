<template>
	<Container v-slot="field">
		<a-table
			v-permission="'manager:entity:rule:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
			:scroll="{ y: field.height - 36 }"
		>
			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updatedAt) }}
			</template>

			<template #operations="{ record }">
				<Operation :data="record" :list="operations"></Operation>
			</template>
		</a-table>
	</Container>
</template>

<script lang="ts" setup>
import { DeleteEntityRule, UpdateEntityRule } from '@/api/manager/entity/api';
import { EntityRule } from '@/api/manager/entity/type';
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';

const emit = defineEmits(['refresh', 'update', 'add', 'pageChange']);

const props = defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	total: number;
}>();

const page = ref<Pagination>({
	page: 1,
	pageSize: 10
});

const operations = [
	{
		icon: 'edit',
		text: '修改规则',
		color: 'arcoblue',
		permission: 'manager:entity:rule:update',
		click: (record: EntityRule) => {
			emit('update', record);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除规则',
		color: 'red',
		permission: 'manager:entity:rule:delete',
		click: async (record: EntityRule) => {
			await DeleteEntityRule({ id: record.id });
			emit('refresh');
			Message.success('删除成功');
		}
	}
];

const pageChange = (current: number) => {
	page.value.page = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};
</script>
