<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'ai-agent:knowledge:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
		>
			<template #isOpen="{ record }">
				<a-tag v-if="record.isOpen" color="arcoblue">公开</a-tag>
				<a-tag v-else color="orangered">私有</a-tag>
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updatedAt) }}
			</template>
			<template #status="{ record }">
				<a-tag v-if="record.status === 'processing'" color="arcoblue">处理中</a-tag>
				<a-tag v-if="record.status === 'complete'" color="green">已完成</a-tag>
				<a-tag v-if="record.status === 'fail'" color="red">失败</a-tag>

				<a-tooltip v-if="record.status === 'fail'" :content="record.reason" position="top" mini>
					<div :style="{ paddingLeft: '2px' }">
						<icon-question-circle size="16" />
					</div>
				</a-tooltip>
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'ai-agent:knowledge:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>
					<a-popconfirm content="您确认删除此知识库？" type="warning" @ok="handleDelete(record.id)">
						<a-tag v-permission="'ai-agent:knowledge:delete'" color="red">
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
import { DeleteKnowledge } from '@/api/ai-agent/knowledge/api';
import GTypes from './types';

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

const getKnowledgeTypeName = (tp: string) => {
	let type = '';
	GTypes.knowledgeTypes.forEach((item) => {
		if (item.value === tp) {
			type = item.label;
		}
	});
	return type;
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};

const handleDelete = async (id: number) => {
	await DeleteKnowledge({ id });
	Message.success('删除成功');
	emit('refresh');
};
</script>
