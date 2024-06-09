<template>
	<a-table row-key="id" :loading="loading" :columns="columns" :pagination="false" :data="data" :bordered="false" :size="size">
		<template #status="{ record }">
			<a-switch
				v-model="record.status"
				:disabled="!$hasPermission('manager:role:status') || record.id === 1"
				type="round"
				@change="updateStatus(record)"
			>
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

		<template v-if="$hasPermission('manager:role:menu')" #menu="{ record }">
			<a-tag v-if="record.id != 1" class="cursor-pointer" color="arcoblue" @click="emit('updateMenu', record)">
				<template #icon><icon-menu /></template>
				菜单管理
			</a-tag>
		</template>

		<template #operations="{ record }">
			<a-space class="cursor-pointer">
				<a-tag v-permission="'manager:role:add'" color="arcoblue" @click="emit('add', record.id)">
					<template #icon><icon-plus /></template>
					新建
				</a-tag>

				<a-tag v-if="record.id != 1" v-permission="'manager:role:update'" color="orangered" @click="emit('update', record)">
					<template #icon><icon-edit /></template>
					修改
				</a-tag>

				<!--- 自定义指令无法绑定到组建上 -->
				<template v-if="$hasPermission('manager:role:delete')">
					<a-popconfirm v-if="record.id != 1" content="您确认删除此菜单" type="warning" @ok="handleDelete(record.id)">
						<a-tag color="red">
							<template #icon><icon-delete /></template>
							删除
						</a-tag>
					</a-popconfirm>
				</template>
			</a-space>
		</template>
	</a-table>
</template>

<script lang="ts" setup>
import { DeleteRole, UpdateRoleStatus } from '@/api/manager/role/api';
import { Role } from '@/api/manager/role/type';
import { TableSize, TableColumn } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';

const emit = defineEmits(['refresh', 'update', 'add', 'updateMenu']);

defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
}>();

const handleDelete = async (id: number) => {
	await DeleteRole({ ids: [id] });
	Message.success('删除成功');
	emit('refresh');
};

const updateStatus = (record: Role) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此角色？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateRoleStatus({ id: record.id, status: record.status as boolean });
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
