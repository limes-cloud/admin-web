<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'cron:task:query'"
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
				<a-switch v-model="record.status" :disabled="!$hasPermission('cron:task:update:status')" type="round" @change="updateStatus(record)">
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
					<a-tag v-permission="'cron:task:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>
					<a-popconfirm content="您确认删除此任务？" type="warning" @ok="handleDelete(record.id)">
						<a-tag v-permission="'cron:task:delete'" color="red">
							<template #icon><icon-delete /></template>
							删除
						</a-tag>
					</a-popconfirm>
					<a-dropdown position="br">
						<a-tag color="orangered">
							<template #icon><icon-more /></template>
							更多
						</a-tag>
						<template #content>
							<a-doption v-permission="'cron:task:exec'">
								<a-popconfirm content="您确认要立即执行此任务？" type="warning" @ok="handleExec(record.id)">
									<a-tag color="green" @click.stop>
										<template #icon><icon-play-arrow /></template>
										立即执行
									</a-tag>
								</a-popconfirm>
							</a-doption>
							<a-doption v-permission="'cron:task:log'">
								<a-tag color="pinkpurple" @click="emit('log', record)">
									<template #icon><icon-list /></template>
									执行记录
								</a-tag>
							</a-doption>
						</template>
					</a-dropdown>
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
import { DeleteTask, UpdateTaskStatus, ExecTask } from '@/api/cron/task/api';
import { Task } from '@/api/cron/task/type';
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';

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
	await DeleteTask({ id });
	Message.success('删除成功');
	emit('refresh');
};

const updateStatus = (record: Task) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此任务？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateTaskStatus({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};

const handleExec = (id: number) => {
	ExecTask({ id }).then(() => {
		Message.success('执行成功');
	});
};
</script>
