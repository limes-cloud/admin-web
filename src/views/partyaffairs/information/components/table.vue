<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'partyaffairs:information:query'"
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

			<template #status="{ record }">
				<a-switch v-model="record.status" :disabled="!$hasPermission('partyaffairs:information:update')" type="round" @change="updateStatus(record)">
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
					<a-tag v-permission="'partyaffairs:information:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<a-popconfirm content="您确认删除此资讯？" type="warning" @ok="handleDelete(record.id)">
						<a-tag v-permission="'partyaffairs:information:delete'" color="red">
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
import { DeleteInformation, UpdateInformation } from '@/api/partyaffairs/information/api';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Information } from '@/api/partyaffairs/information/type';

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
	await DeleteInformation({ id });
	Message.success('删除成功');
	emit('refresh');
};

const updateStatus = (record: Information) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此资讯？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateInformation({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
