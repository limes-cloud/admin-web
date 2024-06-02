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
			:scroll="{
				x: 2000,
				y: 200
			}"
		>
			<template #role="{ record }">
				{{ record.role?.name }}
			</template>

			<template #team="{ record }">
				{{ record.department?.name }}
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
				<a-space v-if="record.id != 1" class="cursor-pointer">
					<a-tag v-permission="'manager:user:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<template v-if="$hasPermission('manager:user:reset:password')">
						<a-popconfirm content="您确认重置此用户密码？" type="warning" @ok="handleResetPassword(record.id)">
							<a-tag color="red">
								<template #icon><icon-refresh /></template>
								重置密码
							</a-tag>
						</a-popconfirm>
					</template>

					<template v-if="$hasPermission('manager:user:delete')">
						<a-popconfirm content="您确认删除此用户" type="warning" @ok="handleDelete(record.id)">
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
			:current="page.current"
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
import { TableSize, TableCloumn, Pagination } from '@/types/global';
import Modal from '@arco-design/web-vue/es/modal';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';
import { User } from '@/api/manager/user/type';
import { DeleteUser, ResetUserPassword, UpdateUserStatus } from '@/api/manager/user/api';
import { Message } from '@arco-design/web-vue';

const emit = defineEmits(['refresh', 'update', 'add', 'pageChange']);

const props = defineProps<{
	columns: TableCloumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	pagination: Pagination;
	total: number;
}>();

const page = ref({
	current: 1,
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
	page.value.current = current;
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
	await DeleteUser({ ids: [id] });
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
			await UpdateUserStatus({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
