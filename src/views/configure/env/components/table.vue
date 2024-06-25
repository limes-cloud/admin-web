<template>
	<a-space>
		<a-table
			v-permission="'configure:env:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:pagination="false"
			:data="data"
			:bordered="false"
			:size="size"
		>
			<template #status="{ record }">
				<a-switch v-model="record.status" :disabled="!$hasPermission('configure:env:update:status')" type="round" @change="updateStatus(record)">
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
					<a-tag v-permission="'configure:env:token:query'" color="arcoblue" @click="handleGetToken(record.id)">
						<template #icon><icon-edit /></template>
						获取token
					</a-tag>

					<a-tag v-permission="'configure:env:token:reset'" color="orangered" @click="handleResetToken(record.id)">
						<template #icon><icon-edit /></template>
						重置token
					</a-tag>

					<a-tag v-permission="'configure:env:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<template v-if="$hasPermission('configure:env:delete')">
						<a-popconfirm content="您确认删除此环境" type="warning" @ok="handleDelete(record.id)">
							<a-tag color="red">
								<template #icon><icon-delete /></template>
								删除
							</a-tag>
						</a-popconfirm>
					</template>
				</a-space>
			</template>
		</a-table>
	</a-space>
</template>

<script lang="ts" setup>
import { DeleteEnv, GetEnvToken, ResetEnvToken, UpdateEnvStatus } from '@/api/configure/env/api';
import { Env } from '@/api/configure/env/type';
import { TableSize, TableColumn } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';

const emit = defineEmits(['refresh', 'update', 'pageChange']);

defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
}>();

const updateStatus = (record: Env) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此环境？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateEnvStatus({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};

const handleDelete = async (id: number) => {
	await DeleteEnv({ ids: [id] });
	Message.success('删除成功');
	emit('refresh');
};

const handleGetToken = async (id: number) => {
	const { data } = await GetEnvToken(id);
	Modal.success({
		title: '获取Toekn成功',
		content: `当前环境的token为${data.token}`
	});
};

const handleResetToken = async (id: number) => {
	const { data } = await ResetEnvToken(id);
	Modal.success({
		title: '重置Toekn成功',
		content: `当前环境的token为${data.token}`
	});
};
</script>
