<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'ai-agent:assessment:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
		>
			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updatedAt) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'ai-agent:assessment:query'" color="arcoblue" @click="emit('exec', record)">
						<template #icon><icon-send /></template>
						进入
					</a-tag>
					<a-tag v-permission="'ai-agent:assessment:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>
					<a-popconfirm content="您确认删除此评估？" type="warning" @ok="handleDelete(record.id)">
						<a-tag v-permission="'ai-agent:assessment:delete'" color="red">
							<template #icon><icon-delete /></template>
							删除
						</a-tag>
					</a-popconfirm>
				</a-space>
			</template>
		</a-table>
		<a-pagination
			:total="total"
			:current="page.page"
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
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { Message } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';
import { DeleteAssessment } from '@/api/ai-agent/assessment/api';

const emit = defineEmits(['refresh', 'update', 'pageChange', 'exec']);

const props = defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	pagination: Pagination;
	total: number;
}>();

const page = ref<Pagination>({
	page: 1,
	pageSize: 10
});

watch(
	() => props.pagination,
	(val) => {
		page.value = { ...val };
	},
	{ deep: true, immediate: true }
);

const pageChange = (current: number) => {
	page.value.page = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};

const handleDelete = async (id: number) => {
	await DeleteAssessment({ id });
	Message.success('删除成功');
	emit('refresh');
};
</script>
