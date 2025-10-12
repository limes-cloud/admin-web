<template>
	<Container v-slot="value">
		<a-table
			v-permission="'manager:log:auth:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
			:scroll="{ y: value.height - 36 }"
		>
			<template #type="{ record }">
				{{ getTypeName(record.type) }}
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
	</Container>
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
</template>

<script lang="ts" setup>
import { ListChannelType } from '@/api/manager/channel/api';
import { ChannelType } from '@/api/manager/channel/type';
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

const types = ref<Record<string, ChannelType>>({});
const handleGetTypes = async () => {
	const { data } = await ListChannelType();
	data.list.forEach((item) => {
		types[item.keyword] = item;
	});
	types['username'] = '账户鉴权';
};

handleGetTypes();

const getTypeName = (key: string) => {
	if (types[key]) {
		return types[key].name;
	}
	return '未知';
};

const pageChange = (current: number) => {
	page.value.page = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};
</script>
