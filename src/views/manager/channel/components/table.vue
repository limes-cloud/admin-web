<template>
	<Container v-slot="value">
		<a-table
			v-permission="'manager:channel:query'"
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
					<span>{{ record.keyword }}</span>
				</a-avatar>
			</template>
			<template #status="{ record }">
				<a-switch v-model="record.status" :disabled="!$hasPermission('manager:channel:update')" type="round" @change="updateStatus(record)">
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
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Channel } from '@/api/manager/channel/type';
import { DeleteChannel, UpdateChannel } from '@/api/manager/channel/api';
import { TableSize, TableColumn, Pagination } from '@/types/global';

const emit = defineEmits(['update', 'refresh', 'pageChange']);
const page = ref<Pagination>({
	page: 1,
	pageSize: 10
});

defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	pagination: Pagination;
	total: number;
}>();

const operations = [
	{
		icon: 'edit',
		text: '修改渠道',
		color: 'arcoblue',
		permission: 'manager:channel:update',
		click: (record: Channel) => {
			emit('update', record);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除渠道',
		color: 'red',
		permission: 'manager:channel:delete',
		click: async (record: Channel) => {
			await DeleteChannel({ id: record.id });
			emit('refresh');
			Message.success('删除成功');
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

const updateStatus = (record: Channel) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此渠道？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateChannel({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
