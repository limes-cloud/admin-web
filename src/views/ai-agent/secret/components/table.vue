<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'ai-agent:secret:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
		>
			<template #group="{ record }">
				<template v-if="record.group">{{ record.group.name }}</template>
				<template v-else>暂无分组</template>
			</template>
			<template #status="{ record }">
				<a-switch v-model="record.status" :disabled="!$hasPermission('ai-agent:secret:update')" type="round" @change="updateStatus(record)">
					<template #checked>启用</template>
					<template #unchecked>禁用</template>
				</a-switch>
				<a-tooltip v-if="!record.status" :content="record.reason" position="top" mini>
					<div :style="{ paddingLeft: '2px' }">
						<icon-question-circle size="16" />
					</div>
				</a-tooltip>
			</template>
			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updatedAt) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'ai-agent:secret:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>
					<a-popconfirm content="您确认删除此密钥？" type="warning" @ok="handleDelete(record.id)">
						<a-tag v-permission="'ai-agent:secret:delete'" color="red">
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
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';
import { Secret } from '@/api/ai-agent/secret/type';
import { DeleteSecret, UpdateSecret } from '@/api/ai-agent/secret/api';

const emit = defineEmits(['refresh', 'update', 'pageChange', 'exec', 'log']);

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

const handleDelete = async (id: number) => {
	await DeleteSecret({ id });
	Message.success('删除成功');
	emit('refresh');
};

const updateStatus = (record: Secret) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此密钥？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateSecret({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
