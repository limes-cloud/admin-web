<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'manager:user:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
		>
			<template #role="{ record }">
				{{ record.role?.name }}
			</template>

			<template #team="{ record }">
				{{ record.Dept?.name }}
			</template>

			<template #avatar="{ record }">
				<a-avatar>
					<img v-if="!record.avatar" alt="avatar" :src="$logo" />
					<img alt="avatar" :src="$rurl(record.avatar)" />
				</a-avatar>
			</template>

			<template #gender="{ record }">
				<a-tag v-if="record.gender == 'M'" color="arcoblue">
					<template #icon><icon-man /></template>
					{{ $genderList[record.gender] }}
				</a-tag>
				<a-tag v-if="record.gender == 'F'" color="red">
					<template #icon><icon-woman /></template>
					{{ $genderList[record.gender] }}
				</a-tag>
			</template>

			<template #status="{ record }">
				<a-switch
					v-model="record.status"
					:disabled="!$hasPermission('manager:user:status') || record.id == 1"
					type="round"
					@change="updateStatus(record)"
				>
					<template #checked>启用</template>
					<template #unchecked>禁用</template>
				</a-switch>
			</template>

			<template #loggedAt="{ record }">
				{{ $formatTime(record.loggedAt) }}
			</template>
			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updatedAt) }}
			</template>

			<template #operations="{ record }">
				<Operation v-if="record.id != 1" :data="record" :list="operations"></Operation>
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
import Modal from '@arco-design/web-vue/es/modal';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';
import { User } from '@/api/manager/user/type';
import { DeleteUser, ResetUserPassword, UpdateUser } from '@/api/manager/user/api';
import { Message } from '@arco-design/web-vue';

const emit = defineEmits(['refresh', 'update', 'add', 'dept', 'role', 'pageChange']);

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

const operations = [
	{
		icon: 'user-group',
		text: '部门绑定',
		color: 'arcoblue',
		permission: 'manager:user:dept',
		click: (record: User) => {
			emit('dept', record);
		}
	},
	// {
	// 	icon: 'user-group',
	// 	text: '详细信息',
	// 	color: 'arcoblue',
	// 	permission: 'manager:user:dept',
	// 	click: (record: User) => {
	// 		emit('dept', record);
	// 	}
	// },
	{
		icon: 'edit',
		text: '修改用户',
		color: 'arcoblue',
		permission: 'manager:user:update',
		click: (record: User) => {
			emit('update', record);
		}
	},
	{
		icon: 'refresh',
		popconfirm: true,
		text: '重置密码',
		color: 'warning',
		permission: 'manager:user:reset:password',
		click: (record: User) => {
			handleResetPassword(record.id);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除用户',
		color: 'red',
		permission: 'manager:user:delete',
		click: (record: User) => {
			handleDelete(record.id);
		}
	}
];

const pageChange = (current: number) => {
	page.value.page = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};

const handleResetPassword = async (id: number) => {
	await ResetUserPassword({ id });
	Message.success('重置成功');
};

const handleDelete = async (id: number) => {
	await DeleteUser({ id });
	Message.success('删除成功');
	emit('refresh');
};

const updateStatus = (record: User) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此用户？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateUser({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
