<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'notify:template:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:scroll="{
				x: '100%',
				y: '300px'
			}"
			:bordered="false"
			:pagination="false"
		>
			<template #channel="{ record }">
				{{ record.channel.name }}
			</template>
			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updatedAt) }}
			</template>
			<template #status="{ record }">
				<a-switch v-model="record.status" :disabled="!$hasPermission('notify:template:update')" type="round" @change="updateStatus(record)">
					<template #checked>启用</template>
					<template #unchecked>禁用</template>
				</a-switch>
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'notify:template:update'" color="arcoblue" @click="emit('send', record)">
						<template #icon><icon-send /></template>
						测试
					</a-tag>

					<a-tag v-permission="'notify:template:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<a-popconfirm content="您确认删除此分组" type="warning" @ok="handleDelete(record.id)">
						<a-tag v-permission="'notify:template:delete'" color="red">
							<template #icon><icon-delete /></template>
							删除
						</a-tag>
					</a-popconfirm>
				</a-space>
			</template>
		</a-table>
	</a-space>
</template>

<script lang="ts" setup>
import { DeleteNotifyCategory } from '@/api/notify/notify/api';
import { UpdateTemplate } from '@/api/notify/template/api';
import { Template } from '@/api/notify/template/type';
import { TableColumn } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';

const emit = defineEmits(['refresh', 'update', 'send', 'pageChange']);

defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
}>();

const handleDelete = async (id: number) => {
	await DeleteNotifyCategory({ id });
	Message.success('删除成功');
	emit('refresh');
};

const updateStatus = (record: Template) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此模板？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateTemplate({ id: record.id, status: record.status, notifyId: record.notifyId });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
