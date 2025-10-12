<template>
	<Container v-slot="value">
		<a-table
			row-key="id"
			:loading="loading"
			:columns="columns"
			:pagination="false"
			:data="data"
			:bordered="false"
			:size="size"
			:scroll="{ x: '100%', y: value.height - 36 }"
		>
			<template #title="{ record }">
				<a-space>
					{{ record.title }}
				</a-space>
			</template>

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
import { DeleteDept } from '@/api/manager/dept/api';
import { Dept } from '@/api/manager/dept/type';
import { TableSize, TableColumn } from '@/types/global';
import { Message } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';

const emit = defineEmits(['update', 'add', 'role', 'refresh']);

defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
}>();

const operations = [
	{
		icon: 'safe',
		text: '角色绑定',
		color: 'arcoblue',
		permission: 'manager:dept:role:add',
		click: (record: Dept) => {
			emit('role', record);
		}
	},
	{
		icon: 'plus',
		text: '新增部门',
		color: 'arcoblue',
		permission: 'manager:dept:add',
		click: (record: Dept) => {
			emit('add', record.id);
		}
	},
	{
		icon: 'edit',
		text: '修改部门',
		color: 'arcoblue',
		permission: 'manager:dept:update',
		click: (record: Dept) => {
			emit('update', record);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除部门',
		color: 'red',
		permission: 'manager:dept:delete',
		click: async (record: Dept) => {
			await DeleteDept({ id: record.id });
			emit('refresh');
			Message.success('删除成功');
		}
	}
];
</script>
