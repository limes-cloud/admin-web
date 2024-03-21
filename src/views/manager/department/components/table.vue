<template>
	<a-table
		v-permission="'manager:department:query'"
		row-key="id"
		:loading="loading"
		:columns="columns"
		:pagination="false"
		:data="data"
		:bordered="false"
		:size="size"
	>
		<template #title="{ record }">
			<a-space>
				{{ record.title }}
			</a-space>
		</template>

		<template #createdAt="{ record }">
			{{ $formatTime(record.created_at) }}
		</template>
		<template #updatedAt="{ record }">
			{{ $formatTime(record.updated_at) }}
		</template>

		<template #operations="{ record }">
			<a-space class="cursor-pointer">
				<a-tag v-permission="'manager:department:object:query'" color="arcoblue" @click="emit('object', record.id)">
					<template #icon><icon-list /></template>
					资源
				</a-tag>

				<a-tag v-permission="'manager:department:add'" color="arcoblue" @click="emit('add', record.id)">
					<template #icon><icon-plus /></template>
					新建
				</a-tag>

				<a-tag v-if="record.id != 1" v-permission="'manager:department:update'" color="orangered" @click="emit('update', record)">
					<template #icon><icon-edit /></template>
					修改
				</a-tag>

				<template v-if="$hasPermission('manager:department:delete')">
					<a-popconfirm v-if="record.id != 1" content="您确认删除此部门" type="warning" @ok="emit('delete', record.id)">
						<a-tag color="red">
							<template #icon><icon-delete /></template>
							删除
						</a-tag>
					</a-popconfirm>
				</template>
			</a-space>
		</template>
	</a-table>
</template>

<script lang="ts" setup>
import { TableSize, TableCloumn } from '@/types/global';
import { TableData } from '@arco-design/web-vue/es/table/interface';

const emit = defineEmits(['delete', 'update', 'add', 'object']);

defineProps<{
	columns: TableCloumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
}>();
</script>
