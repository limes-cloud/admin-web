<template>
	<a-table row-key="id" :loading="loading" :columns="columns" :pagination="false" :data="data" :bordered="false" :size="size">
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

			<!-- <a-space class="cursor-pointer">
				<a-tag v-permission="'manager:job:update'" color="orangered" @click="emit('update', { ...record })">
					<template #icon><icon-edit /></template>
					修改
				</a-tag>

				<template v-if="$hasPermission('manager:job:delete')">
					<a-popconfirm content="您确认删除此职位" type="warning" @ok="handleDelete(record.id)">
						<a-tag color="red">
							<template #icon><icon-delete /></template>
							删除
						</a-tag>
					</a-popconfirm>
				</template>
			</a-space> -->
		</template>
	</a-table>
</template>

<script lang="ts" setup>
import { DeleteJob } from '@/api/manager/job/api';
import { Job } from '@/api/manager/job/type';
import { TableSize, TableColumn } from '@/types/global';
import { Message } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';

const emit = defineEmits(['update', 'add', 'refresh', 'role']);

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
		permission: 'manager:job:role:add',
		click: (record: Job) => {
			emit('role', record);
		}
	},
	{
		icon: 'edit',
		text: '修改职位',
		color: 'arcoblue',
		permission: 'manager:job:update',
		click: (record: Job) => {
			emit('update', record);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除职位',
		color: 'red',
		permission: 'manager:job:delete',
		click: async (record: Job) => {
			await DeleteJob({ id: record.id });
			emit('refresh');
			Message.success('删除成功');
		}
	}
];

const handleDelete = async (id: number) => {
	await DeleteJob({ id });
	Message.success('删除成功');
	emit('refresh');
};
</script>
