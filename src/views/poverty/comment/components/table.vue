<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'poverty:comment:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
		>
			<template #userName="{ record }">
				{{ record.userName ? record.userName : '未实名' }}
			</template>

			<template #userAvatar="{ record }">
				<a-avatar>
					<img v-if="!record.userAvatar" alt="avatar" :src="$logo" />
					<img alt="avatar" :src="$rurl(record.userAvatar)" />
				</a-avatar>
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updatedAt) }}
			</template>

			<template #operations="{ record }">
				<a-popconfirm type="warning" @ok="handleDelete(record.id)">
					<a-tag v-permission="'poverty:banner:delete'" color="red" content="您确认删除此板块">
						<template #icon><icon-delete /></template>
						删除
					</a-tag>
				</a-popconfirm>
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
import { DeleteComment } from '@/api/poverty/comment/api';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import { Message } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';

const emit = defineEmits(['refresh', 'pageChange']);
defineProps<{
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

const pageChange = (current: number) => {
	page.value.page = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};

const handleDelete = async (id: number) => {
	await DeleteComment({ id });
	Message.success('删除成功');
	emit('refresh');
};
</script>
