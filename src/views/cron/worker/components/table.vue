<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'party-affairs:news:content:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
		>
			<template #isTop="{ record }">
				{{ record.is_top ? '是' : '否' }}
			</template>
			<template #classify="{ record }">
				{{ record.classify.name }}
			</template>

			<template #cover="{ record }">
				<img alt="avatar" :src="$rurl(record.resource.src, 100, 100)" />
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.created_at) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updated_at) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'party-affairs:news:comment:query'" color="arcoblue" @click="nav(record.id)">
						<template #icon><icon-message /></template>
						评论
					</a-tag>

					<a-tag v-permission="'party-affairs:news:content:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<a-popconfirm content="您确认删除此内容？" type="warning" @ok="emit('delete', record.id)">
						<a-tag v-permission="'party-affairs:news:content:delete'" color="red">
							<template #icon><icon-delete /></template>
							删除
						</a-tag>
					</a-popconfirm>
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
import router from '@/router';
import { TableSize, TableCloumn, Pagination } from '@/types/global';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';

const emit = defineEmits(['delete', 'update', 'add', 'pageChange', 'disable', 'enable', 'offline', 'resetPassword']);

const props = defineProps<{
	columns: TableCloumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	pagination: Pagination;
	total: number;
}>();

const page = ref({
	current: 1,
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
	page.value.current = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};

const nav = (id: number) => {
	router.push({ name: 'PartyAffairsNewsComment', query: { id } });
};
</script>
