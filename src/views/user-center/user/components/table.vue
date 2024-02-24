<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'uc:user:query'"
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
					<img v-else alt="avatar" :src="$rurl(record.resource.src)" />
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
				<a-switch v-model="record.status" :disabled="!$hasPermission('uc:user:status')" type="round" @change="changeStatus(record)">
					<template #checked>启用</template>
					<template #unchecked>禁用</template>
				</a-switch>
			</template>

			<template #lastLogin="{ record }">
				{{ $formatTime(record.last_login) }}
			</template>
			<template #createdAt="{ record }">
				{{ $formatTime(record.created_at) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updated_at) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'uc:user:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<a-popconfirm content="您确认删除此用户" type="warning" @ok="emit('delete', record.id)">
						<a-tag v-permission="'uc:user:delete'" color="red">
							<template #icon><icon-delete /></template>
							删除
						</a-tag>
					</a-popconfirm>

					<a-dropdown position="br">
						<a-tag v-if="$hasPermission('uc:user:offline') || $hasPermission('uc:user:more')" color="orangered">
							<template #icon><icon-more /></template>
							更多
						</a-tag>
						<template #content>
							<a-doption>
								<!--  more-->
								<a-tag v-permission="'uc:user:offline'" color="arcoblue" @click.stop="emit('more', record.id)">
									<template #icon><icon-more /></template>
									详细信息
								</a-tag>
							</a-doption>

							<a-doption>
								<a-popconfirm content="您确认要下线此用户" type="warning" @ok="emit('offline', record.id)">
									<a-tag v-permission="'uc:user:offline'" color="red" @click.stop>
										<template #icon><icon-poweroff /></template>
										下线用户
									</a-tag>
								</a-popconfirm>
							</a-doption>
						</template>
					</a-dropdown>
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

	<a-modal v-model:visible="visible" simple title="用户详细信息" @cancel="visible = false"></a-modal>
</template>

<script lang="ts" setup>
import { TableSize, TableCloumn, Pagination } from '@/types/global';
import Modal from '@arco-design/web-vue/es/modal';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';
import { User } from '@/api/user-center/types/user';

const emit = defineEmits(['delete', 'update', 'add', 'pageChange', 'disable', 'enable', 'offline', 'more']);

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

const visible = ref(false);

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

const changeStatus = (record: User) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此用户？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			if (record.status) {
				emit('enable', record);
			} else {
				// todo 后期优化
				record.disable_desc = '用户违规';
				emit('disable', record);
			}
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
