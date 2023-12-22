<template>
	<a-table
		v-permission="'configure:environment:query'"
		row-key="id"
		:loading="loading"
		:columns="columns"
		:pagination="false"
		:data="data"
		:bordered="false"
		:size="size"
	>
		<template #status="{ record }">
			<a-tag v-if="record.status" color="arcoblue">启用</a-tag>
			<a-tag v-else color="orangered">禁用</a-tag>
		</template>

		<template #createdAt="{ record }">
			{{ $formatTime(record.created_at) }}
		</template>
		<template #updatedAt="{ record }">
			{{ $formatTime(record.updated_at) }}
		</template>

		<template #operations="{ record }">
			<a-space class="cursor-pointer">
				<a-tag v-permission="'configure:environment:token:query'" color="arcoblue" @click="emit('queryToken', record.id)">
					<template #icon><icon-edit /></template>
					获取token
				</a-tag>

				<a-tag v-permission="'configure:environment:token:reset'" color="orangered" @click="emit('resetToken', record.id)">
					<template #icon><icon-edit /></template>
					重置token
				</a-tag>

				<a-tag v-permission="'configure:environment:update'" color="orangered" @click="emit('update', record)">
					<template #icon><icon-edit /></template>
					修改
				</a-tag>

				<template v-if="$hasPermission('configure:environment:delete')">
					<a-popconfirm content="您确认删除此环境" type="warning" @ok="emit('delete', record.id)">
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

const emit = defineEmits(['delete', 'update', 'add', 'resetToken', 'queryToken']);

defineProps<{
	columns: TableCloumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
}>();
</script>
