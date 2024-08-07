<template>
	<a-space direction="vertical" fill>
		<a-table v-permission="'poverty:chat:query'" row-key="id" :loading="loading" :columns="columns" :data="data" :bordered="false" :pagination="false">
			<template #type="{ record }">
				<a-tag v-if="record.type == 'send'" color="arcoblue">发送</a-tag>
				<a-tag v-else color="green">回复</a-tag>
			</template>

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
				{{ record }}
				<a-space class="cursor-pointer">
					<a-tag v-permission="'poverty:chat:update'" color="orangered">
						<template #icon><icon-edit /></template>
						详细
					</a-tag>
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
import { Pagination, TableColumn, TableSize } from '@/types/global';
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
</script>
