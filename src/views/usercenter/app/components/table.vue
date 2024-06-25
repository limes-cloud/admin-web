<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'uc:app:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:pagination="false"
			:data="data"
			:bordered="false"
			:size="size"
		>
			<template #logo="{ record }">
				<a-avatar v-if="record.logoUrl" alt="avatar" :size="38" shape="square">
					<img alt="avatar" :src="$rurl(record.logoUrl, 100, 100)" />
				</a-avatar>
				<a-avatar v-else :style="{ backgroundColor: '#3370ff' }" :size="48" shape="square">
					<span>{{ record.name }}</span>
				</a-avatar>
			</template>
			<template #status="{ record }">
				<a-space>
					<a-switch v-model="record.status" :disabled="!$hasPermission('uc:app:update:status')" type="round" @change="updateStatus(record)">
						<template #checked>启用</template>
						<template #unchecked>禁用</template>
					</a-switch>
					<a-tooltip v-if="!record.status" :content="record.disableDesc"><icon-question-circle /></a-tooltip>
				</a-space>
			</template>
			<template #allowRegistry="{ record }">
				<a-tag v-if="record.allowRegistry" color="arcoblue">是</a-tag>
				<a-tag v-else color="orangered">否</a-tag>
			</template>
			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updatedAt) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'uc:app:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>
					<template v-if="$hasPermission('uc:app:delete')">
						<a-popconfirm content="您确认删除此应用" type="warning" @ok="handleDelete(record.id)">
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
			:current="page.page"
			:page-size="page.pageSize"
			show-total
			show-jumper
			show-page-size
			@change="pageChange"
			@page-size-change="pageSizeChange"
		/>
	</a-space>

	<a-modal v-model:visible="disableVisible" simple title="应用禁用" @cancel="handleCancelDisable" @before-ok="handleDisable">
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
				<a-textarea v-model="disableForm.disableDesc" placeholder="请输入禁用原因" />
			</a-form-item>
		</a-form>
	</a-modal>
</template>

<script lang="ts" setup>
import { DeleteApp, UpdateAppStatus } from '@/api/usercenter/app/api';
import { App } from '@/api/usercenter/app/type';
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { ref } from 'vue';

const emit = defineEmits(['update', 'refresh', 'pageChange']);

const page = ref<Pagination>({
	page: 1,
	pageSize: 10
});

const disableVisible = ref(false);
const disableForm = ref<{ disableDesc?: string }>({});
const curApp = ref<App>();
const disableVisibleRef = ref();

defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	pagination: Pagination;
	total: number;
}>();

const pageChange = (current: number) => {
	page.value.page = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};

const updateStatus = (record: App) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此应用？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			if (!record.status) {
				curApp.value = record;
				disableVisible.value = true;
				disableForm.value = {};
				return;
			}
			await UpdateAppStatus({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};

const handleDisable = async () => {
	if (!curApp.value) return;
	const app = curApp.value;
	UpdateAppStatus({ id: app.id, status: app.status as boolean, disableDesc: disableForm.value.disableDesc as string })
		.then(() => {
			app.disableDesc = disableForm.value.disableDesc;
			Message.success(`禁用成功`);
		})
		.catch(() => {
			app.status = !app.status;
		});
};

const handleCancelDisable = () => {
	disableVisible.value = false;
	if (!curApp.value) return;
	const user = curApp.value;
	user.status = !user.status;
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await DeleteApp({ ids: [id] });
	emit('refresh');
	Message.success('删除成功');
};
</script>
