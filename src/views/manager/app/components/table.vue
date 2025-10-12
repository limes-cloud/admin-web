<template>
	<Container v-slot="value">
		<a-table
			row-key="id"
			:loading="loading"
			:columns="columns"
			:pagination="false"
			:data="data"
			:bordered="false"
			:size="size"
			:scroll="{ y: value.height - 36 }"
		>
			<template #logo="{ record }">
				<a-avatar v-if="record.logo" alt="avatar" :size="38" shape="square">
					<img alt="avatar" :src="$rurl(record.logo, 100, 100)" />
				</a-avatar>
				<a-avatar v-else :style="{ backgroundColor: '#3370ff' }" :size="48" shape="square">
					<span>{{ record.name }}</span>
				</a-avatar>
			</template>
			<template #status="{ record }">
				<a-space>
					<a-switch v-model="record.status" :disabled="!$hasPermission('manager:app:update')" type="round" @change="updateStatus(record)">
						<template #checked>启用</template>
						<template #unchecked>禁用</template>
					</a-switch>
					<a-tooltip v-if="!record.status" :content="record.disableDesc"><icon-question-circle /></a-tooltip>
				</a-space>
			</template>
			<template #private="{ record }">
				<a-tag v-if="record.private" color="arcoblue">是</a-tag>
				<a-tag v-else>否</a-tag>
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
	</Container>
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
import { DeleteApp, UpdateApp } from '@/api/manager/app/api';
import { App } from '@/api/manager/app/type';
import { useRouter } from 'vue-router';
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { ref } from 'vue';

const router = useRouter();
const emit = defineEmits(['update', 'refresh', 'pageChange', 'channel', 'field']);

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

// 处理数据删除
const handleDelete = async (id: number) => {
	await DeleteApp({ id });
	emit('refresh');
	Message.success('删除成功');
};

const operations = [
	{
		icon: 'storage',
		text: '实体设置',
		color: 'arcoblue',
		permission: 'manager:entity:query',
		click: (record: App) => {
			router.push({ name: 'ManagerEntity', query: { appId: record.id } });
		}
	},
	{
		icon: 'menu-fold',
		text: '菜单设置',
		color: 'arcoblue',
		permission: 'manager:menu:query',
		click: (record: App) => {
			router.push({ name: 'ManagerAppMenu', query: { appId: record.id } });
		}
	},
	{
		icon: 'safe',
		text: '授权设置',
		color: 'arcoblue',
		click: (record: App) => {
			emit('channel', record);
		}
	},
	{
		icon: 'unordered-list',
		text: '字段设置',
		color: 'arcoblue',
		permission: 'manager:appfield:query',
		click: (record: App) => {
			emit('field', record);
		}
	},
	{
		icon: 'edit',
		text: '修改应用',
		color: 'arcoblue',
		permission: 'manager:app:update',
		click: (record: App) => {
			emit('update', record);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除应用',
		color: 'red',
		permission: 'manager:app:delete',
		click: (record: App) => {
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
			await UpdateApp({ id: record.id, status: record.status as boolean });
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
	UpdateApp({ id: app.id, status: app.status as boolean, disableDesc: disableForm.value.disableDesc as string })
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
</script>
