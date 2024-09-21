<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'application:user:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
			:scroll="{
				x: 1500,
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
					<img v-if="record.avatarUrl" alt="avatar" :src="$rurl(record.avatarUrl, 100, 100)" />
					<img v-else alt="avatar" :src="$logo" />
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
				<a-space>
					<a-switch v-model="record.status" :disabled="!$hasPermission('application:user:update:status')" type="round" @change="updateStatus(record)">
						<template #checked>启用</template>
						<template #unchecked>禁用</template>
					</a-switch>
					<a-tooltip v-if="!record.status" :content="record.disableDesc"><icon-question-circle /></a-tooltip>
				</a-space>
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updatedAt) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'application:user:more'" color="arcoblue" @click.stop="emit('more', record.id)">
						<template #icon><icon-more /></template>
						详细
					</a-tag>
					<a-tag v-permission="'application:user:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<a-popconfirm content="您确认删除此用户" type="warning" @ok="handleDelete(record.id)">
						<a-tag v-permission="'application:user:delete'" color="red">
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

	<a-modal v-model:visible="disableVisible" simple title="用户禁用" @cancel="handleCancelDisable" @before-ok="handleDisable">
		<a-form ref="disableVisibleRef" :model="disableForm" layout="vertical">
			<a-form-item
				field="disableDesc"
				label="禁用原因"
				:rules="[
					{
						required: true,
						message: '禁用原因是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="disableForm.disableDesc" placeholder="请输入禁用原因" />
			</a-form-item>
		</a-form>
	</a-modal>

	<a-modal v-model:visible="visible" simple title="用户详细信息" @cancel="visible = false"></a-modal>
</template>

<script lang="ts" setup>
import { DeleteUser, UpdateUserStatus } from '@/api/application/user/api';
import { User } from '@/api/application/user/type';
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { Message } from '@arco-design/web-vue';
import Modal from '@arco-design/web-vue/es/modal';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';

const emit = defineEmits(['refresh', 'update', 'pageChange', 'more']);

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

const disableVisible = ref(false);
const visible = ref(false);
const disableForm = ref<{ disableDesc?: string }>({});
const curUser = ref<User>();
const disableVisibleRef = ref();

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

// 处理数据删除
const handleDelete = async (id: number) => {
	await DeleteUser({ ids: [id] });
	emit('refresh');
	Message.success('删除成功');
};

const updateStatus = (record: User) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此用户？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			if (!record.status) {
				curUser.value = record;
				disableVisible.value = true;
				disableForm.value = {};
				return;
			}
			await UpdateUserStatus({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};

const handleDisable = async () => {
	if (!curUser.value) return;
	const user = curUser.value;
	UpdateUserStatus({ id: user.id, status: user.status as boolean, disableDesc: disableForm.value.disableDesc as string })
		.then(() => {
			user.disableDesc = disableForm.value.disableDesc;
			Message.success(`禁用成功`);
		})
		.catch(() => {
			user.status = !user.status;
		});
};

const handleCancelDisable = () => {
	disableVisible.value = false;
	if (!curUser.value) return;
	const user = curUser.value;
	user.status = !user.status;
};
</script>
