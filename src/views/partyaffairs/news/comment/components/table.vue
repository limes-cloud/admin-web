<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'partyaffairs:news:content:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
		>
			<template #name="{ record }">
				{{ record.from?.realName }}
			</template>

			<template #nick="{ record }">
				{{ record.from?.nickName }}
			</template>

			<template #text="{ record }">
				<a-tooltip :content="record.text">
					<div class="text">{{ record.text }}</div>
				</a-tooltip>
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.created_at) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-popconfirm content="您确认删除此评论？" type="warning" @ok="emit('delete', record.id)">
						<a-tag v-permission="'partyaffairs:news:comment:delete'" color="red">
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
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';

const emit = defineEmits(['delete', 'update', 'add', 'pageChange', 'disable', 'enable', 'offline', 'resetPassword']);

const props = defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	pagination: Pagination;
	total: number;
}>();

const page = ref({
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
</script>

<style lang="less" scoped>
.text {
	display: -webkit-box; /* Safari */
	max-width: 400px;
	overflow: hidden;
	-webkit-line-clamp: 2; /* number of lines to show */
	-webkit-box-orient: vertical;
}
</style>
