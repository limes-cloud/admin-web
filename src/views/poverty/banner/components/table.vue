<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'poverty:banner:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
		>
			<template #src="{ record }">
				<a-image
					width="200"
					:src="$rurl(record.src, 200, 100)"
					:preview-props="{
						src: record.src
					}"
				/>
			</template>

			<template #status="{ record }">
				<a-switch v-model="record.status" :disabled="!$hasPermission('poverty:banner:update')" type="round" @change="updateStatus(record)">
					<template #checked>启用</template>
					<template #unchecked>禁用</template>
				</a-switch>
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updatedAt) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'poverty:banner:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<a-popconfirm type="warning" @ok="handleDelete(record.id)">
						<a-tag v-permission="'poverty:banner:delete'" color="red" content="您确认删除此板块">
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
import { DeleteBanner, UpdateBanner } from '@/api/poverty/banner/api';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Banner } from '@/api/poverty/banner/type';

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
	await DeleteBanner({ id });
	Message.success('删除成功');
	emit('refresh');
};

const updateStatus = (record: Banner) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此轮播图？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateBanner({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
