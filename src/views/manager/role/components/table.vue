<template>
	<a-table
		v-permission="'manager:role:query'"
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

		<template v-if="$hasPermission('manager:role:menu')" #menu="{ record }">
			<a-tag v-if="record.id != 1" class="cursor-pointer" color="arcoblue" @click="emit('updateMenu', record)">
				<template #icon><icon-menu /></template>
				菜单管理
			</a-tag>
		</template>

		<template #operations="{ record }">
			<a-space class="cursor-pointer">
				<a-tag v-permission="'manager:role:add'" color="arcoblue" @click="emit('add', record.id)">
					<template #icon><icon-plus /></template>
					新建
				</a-tag>

				<a-tag v-if="record.id != 1" v-permission="'manager:role:update'" color="orangered" @click="emit('update', record)">
					<template #icon><icon-edit /></template>
					修改
				</a-tag>

				<!--- 自定义指令无法绑定到组建上 -->
				<template v-if="$hasPermission('manager:role:delete')">
					<a-popconfirm v-if="record.id != 1" content="您确认删除此菜单" type="warning" @ok="emit('delete', record.id)">
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

const emit = defineEmits(['delete', 'update', 'add', 'updateMenu']);

defineProps<{
	columns: TableCloumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
}>();
</script>
