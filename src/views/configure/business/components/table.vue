<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'configure:business:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:pagination="false"
			:data="data"
			:bordered="false"
			:size="size"
		>
			<template #type="{ record }">
				{{ variableTypes[record.type] }}
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.created_at) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updated_at) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'configure:business:value'" color="arcoblue" @click="emit('set', record)">
						<template #icon><icon-edit /></template>
						配置
					</a-tag>

					<a-tag v-permission="'configure:business:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<template v-if="$hasPermission('configure:business:delete')">
						<a-popconfirm content="您确认删除此资源" type="warning" @ok="emit('delete', record.id)">
							<a-tag color="red">
								<template #icon><icon-delete /></template>
								删除
							</a-tag>
						</a-popconfirm>
					</template>
				</a-space>
			</template>
		</a-table>
		<a-pagination
			:total="total"
			:current="page.current"
			:page-size="page.pageSize"
			show-total
			show-jumper
			show-page-size
			@change="pageChange"
			@page-size-change="pageSizeChange"
		/>
	</a-space>
</template>

<script lang="ts" setup>
import { TableSize, TableCloumn, Pagination } from '@/types/global';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { ref } from 'vue';
import variableTypes from './type';

const emit = defineEmits(['delete', 'update', 'add', 'set', 'resetToken', 'queryToken', 'pageChange']);

const page = ref({
	current: 1,
	pageSize: 10
});

defineProps<{
	columns: TableCloumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	pagination: Pagination;
	total: number;
}>();

const pageChange = (current: number) => {
	page.value.current = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};
</script>
