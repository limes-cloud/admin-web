<template>
	<a-table row-key="id" :loading="loading" :columns="columns" :pagination="false" :data="data" :bordered="false" :size="size">
		<template #status="{ record }">
			<a-switch v-model="record.status" :disabled="!$hasPermission('manager:role:update')" type="round" @change="updateStatus(record)">
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
			<Operation :data="record" :list="operations"></Operation>
		</template>
	</a-table>
</template>

<script lang="ts" setup>
import { DeleteRole, UpdateRole } from '@/api/manager/role/api';
import { Role } from '@/api/manager/role/type';
import { TableSize, TableColumn } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';

const emit = defineEmits(['refresh', 'update', 'add', 'menu', 'entity']);

defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
}>();

const operations = [
	{
		icon: 'menu',
		text: '菜单权限',
		color: 'arcoblue',
		permission: 'manager:role:menu:query',
		click: (record: Role) => {
			emit('menu', record);
		}
	},
	{
		icon: 'apps',
		text: '数据权限',
		color: 'arcoblue',
		permission: 'manager:role:entity:query',
		click: (record: Role) => {
			emit('entity', record);
		}
	},
	{
		icon: 'plus',
		text: '新增角色',
		color: 'arcoblue',
		permission: 'manager:role:add',
		click: (record: Role) => {
			emit('add', record.id);
		}
	},
	{
		icon: 'edit',
		text: '修改角色',
		color: 'arcoblue',
		permission: 'manager:role:update',
		click: (record: Role) => {
			emit('update', record);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除角色',
		color: 'red',
		permission: 'manager:role:delete',
		click: async (record: Role) => {
			await DeleteRole({ id: record.id });
			emit('refresh');
			Message.success('删除成功');
		}
	}
];

const handleDelete = async (id: number) => {
	await DeleteRole({ id });
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
			await UpdateRole({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
