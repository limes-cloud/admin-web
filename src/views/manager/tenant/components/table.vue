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
			:scroll="{ x: '100%', y: value.height - 36 }"
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
				<a-switch v-model="record.status" :disabled="!$hasPermission('manager:tenant:update')" type="round" @change="updateStatus(record)">
					<template #checked>启用</template>
					<template #unchecked>禁用</template>
				</a-switch>
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
				<Operation :data="record" :list="operations"></Operation>
			</template>
		</a-table>
	</Container>
	<a-pagination
		class="mt-15"
		:total="total"
		:current="page.page"
		:page-size="page.pageSize"
		show-total
		show-jumper
		show-page-size
		@change="pageChange"
		@page-size-change="pageSizeChange"
	/>
</template>

<script lang="ts" setup>
import { DeleteTenant, UpdateTenant } from '@/api/manager/tenant/api';
import { Tenant } from '@/api/manager/tenant/type';
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { ref } from 'vue';

const emit = defineEmits(['update', 'refresh', 'pageChange', 'app']);

const page = ref<Pagination>({
	page: 1,
	pageSize: 10
});

const operations = [
	{
		icon: 'apps',
		text: '套餐管理',
		color: 'arcoblue',
		permission: 'manager:tenantapp:query',
		click: (record: Tenant) => {
			emit('app', record);
		}
	},
	{
		icon: 'edit',
		text: '修改租户',
		color: 'arcoblue',
		permission: 'manager:tenant:update',
		click: (record: Tenant) => {
			emit('update', record);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除租户',
		color: 'red',
		permission: 'manager:tenant:delete',
		click: async (record: Tenant) => {
			await DeleteTenant({ id: record.id });
			emit('refresh');
			Message.success('删除成功');
		}
	}
];

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

const updateStatus = (record: Tenant) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此租户？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateTenant({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
