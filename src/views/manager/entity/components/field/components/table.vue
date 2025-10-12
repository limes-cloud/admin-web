<template>
	<Container v-slot="field">
		<a-table
			v-permission="'manager:entity:field:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
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
import { DeleteEntityField, UpdateEntityField } from '@/api/manager/entity/api';
import { EntityField } from '@/api/manager/entity/type';
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';

const emit = defineEmits(['refresh', 'update', 'add', 'pageChange']);

defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
}>();

const operations = [
	{
		icon: 'edit',
		text: '修改字段',
		color: 'arcoblue',
		permission: 'manager:entity:field:update',
		click: (record: EntityField) => {
			emit('update', record);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除字段',
		color: 'red',
		permission: 'manager:entity:field:delete',
		click: async (record: EntityField) => {
			await DeleteEntityField({ id: record.id });
			emit('refresh');
			Message.success('删除成功');
		}
	}
];
</script>
