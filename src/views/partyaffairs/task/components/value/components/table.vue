<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'partyaffairs:task:value:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
		>
			<template #userId="{ record }">
				{{ record.userId }}
			</template>
			<template #name="{ record }">
				{{ record.user.realName ?? '未实名' }}
			</template>
			<template #email="{ record }">
				{{ record.user.email ?? '未绑定' }}
			</template>
			<template #phone="{ record }">
				{{ record.user.phone ?? '未绑定' }}
			</template>
			<template #createdAt="{ record }">
				{{ record.id ? $formatTime(record.createdAt) : '未填写' }}
			</template>
			<template #updatedAt="{ record }">
				{{ record.id ? $formatTime(record.updatedAt) : '未填写' }}
			</template>

			<template #operations="{ record }">
				<a-space v-if="record.id" class="cursor-pointer">
					<a-tag v-permission="'partyaffairs:task:value:query'" color="arcoblue" @click="emit('more', record)">
						<template #icon><icon-more /></template>
						详情
					</a-tag>
					<a-popconfirm content="您确认删除此任务记录" type="warning" @ok="emit('delete', record.id)">
						<a-tag v-permission="'partyaffairs:task:value:delete'" color="red">
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

const emit = defineEmits(['delete', 'more', 'add', 'pageChange']);

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
