<template>
	<a-table
		v-permission="'partyaffairs:resource:classify:query'"
		row-key="id"
		:loading="loading"
		:columns="columns"
		:data="data"
		:size="size"
		:scroll="{
			x: '100%',
			y: '300px'
		}"
		:bordered="false"
		:pagination="false"
	>
		<template #createdAt="{ record }">
			{{ $formatTime(record.createdAt) }}
		</template>
		<template #updatedAt="{ record }">
			{{ $formatTime(record.updatedAt) }}
		</template>

		<template #operations="{ record }">
			<a-space class="cursor-pointer">
				<a-tag v-permission="'partyaffairs:resource:classify:update'" color="orangered" @click="emit('update', record)">
					<template #icon><icon-edit /></template>
					修改
				</a-tag>

				<a-popconfirm content="您确认删除此分组" type="warning" @ok="handleDelete(record.id)">
					<a-tag v-permission="'partyaffairs:resource:classify:delete'" color="red">
						<template #icon><icon-delete /></template>
						删除
					</a-tag>
				</a-popconfirm>
			</a-space>
		</template>
	</a-table>
</template>

<script lang="ts" setup>
import { DeleteResourceClassify } from '@/api/partyaffairs/resource/api';
import { TableColumn, TableSize } from '@/types/global';
import { Message } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';

const emit = defineEmits(['refresh', 'update', 'pageChange']);

defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
}>();

const handleDelete = async (id: number) => {
	await DeleteResourceClassify({ id });
	Message.success('删除成功');
	emit('refresh');
};
</script>
