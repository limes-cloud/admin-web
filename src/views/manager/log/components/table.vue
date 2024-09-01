<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'manager:user:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
		>
			<template #type="{ record }">
				<template v-if="record.type == 'phone'">手机</template>
				<template v-if="record.type == 'email'">邮箱</template>
			</template>

			<template #ip="{ record }">{{ record.ip }}({{ record.address }})</template>

			<template #code="{ record }">
				<a-tag v-if="record.code === 200" color="green">
					<template #icon><icon-check-circle /></template>
					{{ record.code }}
				</a-tag>
				<a-tag v-else color="red">
					<template #icon><icon-close-circle /></template>
					{{ record.code }}
				</a-tag>
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
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

const emit = defineEmits(['refresh', 'update', 'add', 'pageChange']);

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
</script>
