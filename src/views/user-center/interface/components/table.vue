<template>
	<a-table
		v-permission="'uc:app:interface:query'"
		row-key="id"
		:loading="loading"
		:columns="columns"
		:pagination="false"
		:data="data"
		:bordered="false"
		:size="size"
	>
		<template #type="{ record }">
			<a-tag v-if="record.type === 'A'" color="orange">接口｜{{ record.method }}</a-tag>
			<a-tag v-if="record.type === 'G'" color="green">分组</a-tag>
		</template>

		<template #createdAt="{ record }">
			{{ $formatTime(record.created_at) }}
		</template>
		<template #updatedAt="{ record }">
			{{ $formatTime(record.updated_at) }}
		</template>

		<template #operations="{ record }">
			<a-space class="cursor-pointer">
				<a-tag v-permission="'uc:app:interface:add'" color="arcoblue" @click="emit('add', record)">
					<template #icon><icon-plus /></template>
					新建
				</a-tag>

				<a-tag v-permission="'uc:app:interface:update'" color="orangered" @click="emit('update', record)">
					<template #icon><icon-edit /></template>
					修改
				</a-tag>

				<template v-if="$hasPermission('uc:app:interface:delete')">
					<a-popconfirm content="您确认删除此菜单" type="warning" @ok="emit('delete', record.id)">
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

const emit = defineEmits(['delete', 'update', 'add']);

defineProps<{
	columns: TableCloumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
}>();
</script>
