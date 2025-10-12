<template>
	<Container v-slot="value">
		<a-table
			v-permission="'manager:dictionary:value:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
			:scroll="{ y: value.height - 36 }"
		>
			<template #status="{ record }">
				<a-switch v-model="record.status" :disabled="!$hasPermission('manager:dictionary:value:status')" type="round" @change="updateStatus(record)">
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
				<Operation :data="record" :list="getOpt()"></Operation>
			</template>
		</a-table>
	</Container>
	<a-pagination
		v-if="dataType == 'list'"
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
import { DeleteDictionaryValue, UpdateDictionaryValue } from '@/api/manager/dictionary/api';
import { DictionaryValue } from '@/api/manager/dictionary/type';
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';

const emit = defineEmits(['refresh', 'update', 'add', 'pageChange']);

const props = defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	pagination: Pagination;
	total: number;
	dataType: string;
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

const addOpt = [
	{
		icon: 'plus',
		text: '新增值',
		color: 'arcoblue',
		permission: 'manager:dictionary:value:add',
		click: (record: DictionaryValue) => {
			emit('add', record.id);
		}
	}
];

const operations = [
	{
		icon: 'edit',
		text: '修改值',
		color: 'arcoblue',
		permission: 'manager:dictionary:value:update',
		click: (record: DictionaryValue) => {
			emit('update', record);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除值',
		color: 'red',
		permission: 'manager:dictionary:value:delete',
		click: async (record: DictionaryValue) => {
			await DeleteDictionaryValue({ id: record.id });
			emit('refresh');
			Message.success('删除成功');
		}
	}
];

const getOpt = () => {
	if (props.dataType === 'list') {
		return operations;
	}
	return [...addOpt, ...operations];
};

const pageChange = (current: number) => {
	page.value.page = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};

// const handleDelete = async (id: number) => {
// 	await DeleteDictionaryValueValue({ id });
// 	Message.success('删除成功');
// 	emit('refresh');
// };

const updateStatus = (record: DictionaryValue) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此字典值？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateDictionaryValue({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
