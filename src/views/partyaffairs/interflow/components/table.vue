<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'partyaffairs:resource:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
		>
			<template #cover="{ record }">
				<a-image
					width="100"
					:src="$rurl(record.cover, 200, 100)"
					:preview-props="{
						src: record.cover
					}"
				/>
			</template>
			<template #isTop="{ record }">
				<a-tag v-if="record.isTop" color="arcoblue">是</a-tag>
				<a-tag v-else>否</a-tag>
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updatedAt) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'partyaffairs:resource:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<a-popconfirm content="您确认删除此资料？" type="warning" @ok="handleDelete(record.id)">
						<a-tag v-permission="'partyaffairs:resource:delete'" color="red">
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
import { DeleteResource } from '@/api/partyaffairs/resource/api';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import { Message } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';

const emit = defineEmits(['refresh', 'update', 'pageChange']);
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
	await DeleteResource({ id });
	Message.success('删除成功');
	emit('refresh');
};
</script>
