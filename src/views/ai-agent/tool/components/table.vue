<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'ai-agent:tool:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
		>
			<template #icon="{ record }">
				<a-avatar v-if="record.iconUrl" alt="avatar" :size="48" shape="square">
					<img alt="avatar" :src="$rurl(record.iconUrl, 100, 100)" />
				</a-avatar>
				<a-avatar v-else :style="{ backgroundColor: '#3370ff' }" :size="48" shape="square">
					<span>{{ record.title }}</span>
				</a-avatar>
			</template>
			<template #type="{ record }">
				{{ getToolTypeName(record.type) }}
			</template>
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

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'ai-agent:tool:query'" color="arcoblue" @click="emit('exec', record)">
						<template #icon><icon-send /></template>
						运行
					</a-tag>
					<a-tag v-permission="'ai-agent:tool:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>
					<a-popconfirm content="您确认删除此工具？" type="warning" @ok="handleDelete(record.id)">
						<a-tag v-permission="'ai-agent:tool:delete'" color="red">
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
import { DeleteTool } from '@/api/ai-agent/tool/api';
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

const getToolTypeName = (tp: string) => {
	let type = '';
	GTypes.toolTypes.forEach((item) => {
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
	await DeleteTool({ id });
	Message.success('删除成功');
	emit('refresh');
};
</script>
