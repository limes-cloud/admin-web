<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'configure:server:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:pagination="false"
			:data="data"
			:bordered="false"
			:size="size"
		>
			<template #status="{ record }">
				<a-switch v-model="record.status" :disabled="!$hasPermission('configure:server:update:status')" type="round" @change="updateStatus(record)">
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
					<a-tag v-permission="'configure:server:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<template v-if="$hasPermission('configure:server:delete')">
						<a-popconfirm content="您确认删除此服务" type="warning" @ok="handleDelete(record.id)">
							<a-tag color="red">
								<template #icon><icon-delete /></template>
								删除
							</a-tag>
						</a-popconfirm>
					</template>
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
import { DeleteServer, UpdateServerStatus } from '@/api/configure/server/api';
import { Server } from '@/api/configure/server/type';
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { ref } from 'vue';

const emit = defineEmits(['update', 'refresh', 'pageChange']);

const page = ref({
	page: 1,
	pageSize: 10
});

defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	pagination: Pagination;
	total: number;
}>();

const pageChange = (value: number) => {
	page.value.page = value;
	emit('pageChange', page.value);
};

const pageSizeChange = (value: number) => {
	page.value.pageSize = value;
	emit('pageChange', page.value);
};

const handleDelete = async (id: number) => {
	await DeleteServer({ ids: [id] });
	Message.success('删除成功');
	emit('refresh');
};

const updateStatus = (record: Server) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此环境？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateServerStatus({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
