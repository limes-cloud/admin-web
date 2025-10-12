<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'notify:notify:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
		>
			<template #category="{ record }">
				<template v-if="record.category">{{ record.category.name }}</template>
				<template v-else>暂无分组</template>
			</template>
			<template #priority="{ record }">P{{ record.priority }}</template>
			<template #variable="{ record }">
				<a-space>
					<template v-for="(field, index) in getFields(record.variable)" :key="index">
						<a-tag>{{ field }}</a-tag>
					</template>
				</a-space>
			</template>
			<template #status="{ record }">
				<a-switch v-model="record.status" :disabled="!$hasPermission('notify:notify:update')" type="round" @change="updateStatus(record)">
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
					<a-tag v-permission="'notify:template:query'" color="green" @click="emit('template', record)">
						<template #icon><icon-menu /></template>
						配置
					</a-tag>
					<a-tag v-permission="'notify:notify:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>
					<a-popconfirm content="您确认删除此通知？" type="warning" @ok="handleDelete(record.id)">
						<a-tag v-permission="'notify:notify:delete'" color="red">
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
import { DeleteNotify, UpdateNotify } from '@/api/notify/notify/api';
import { Notify } from '@/api/notify/notify/type';
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';

const emit = defineEmits(['refresh', 'update', 'pageChange', 'exec', 'log', 'template']);

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
	await DeleteNotify({ id });
	Message.success('删除成功');
	emit('refresh');
};

const getFields = (list: string[]) => {
	if (list.length > 3) {
		return list.slice(0, 3).concat(['...']);
	}
	return list;
};

const updateStatus = (record: Notify) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此通知？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateNotify({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
