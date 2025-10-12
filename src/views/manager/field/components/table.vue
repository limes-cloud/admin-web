<template>
	<Container v-slot="value">
		<a-table
			v-permission="'manager:field:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:pagination="false"
			:data="data"
			:bordered="false"
			:size="size"
			:scroll="{ y: value.height - 36 }"
		>
			<template #status="{ record }">
				<a-switch v-model="record.status" :disabled="!$hasPermission('manager:field:update:status')" type="round" @change="updateStatus(record)">
					<template #checked>启用</template>
					<template #unchecked>禁用</template>
				</a-switch>
			</template>

			<template #type="{ record }">
				{{ itypes[record.type] ? itypes[record.type] : record.type }}
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
		:current="page.current"
		:page-size="page.pageSize"
		show-total
		show-jumper
		show-page-size
		@change="pageChange"
		@page-size-change="pageSizeChange"
	/>
</template>

<script lang="ts" setup>
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';
import { Field, FieldType } from '@/api/manager/field/type';
import { DeleteField, UpdateField } from '@/api/manager/field/api';
import { Message, Modal } from '@arco-design/web-vue';

const emit = defineEmits(['refresh', 'update', 'pageChange']);

const page = ref({
	current: 1,
	pageSize: 10
});

const props = defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	pagination: Pagination;
	total: number;
	types: FieldType[];
}>();

const itypes = ref({});

const handleTypes = () => {
	const data = {};
	props.types.forEach((item) => {
		data[item.type] = item.name;
	});
	itypes.value = data;
};

watch(
	() => props.types,
	(val) => {
		if (!val) {
			return;
		}
		handleTypes();
	}
);

handleTypes();

const operations = [
	{
		icon: 'edit',
		text: '修改字段',
		color: 'arcoblue',
		permission: 'manager:field:update',
		click: (record: Field) => {
			emit('update', record);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除字段',
		color: 'red',
		permission: 'manager:field:delete',
		click: async (record: Field) => {
			await DeleteField({ id: record.id });
			emit('refresh');
			Message.success('删除成功');
		}
	}
];

const pageChange = (current: number) => {
	page.value.current = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await DeleteField({ id });
	emit('refresh');
	Message.success('删除成功');
};

const updateStatus = (record: Field) => {
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此字段？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateField({ ...record });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};
</script>
