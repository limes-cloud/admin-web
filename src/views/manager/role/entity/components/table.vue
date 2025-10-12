<template>
	<Container v-slot="value">
		<a-table
			v-permission="'manager:role:entity:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:pagination="false"
			:data="data"
			:bordered="false"
			:size="size"
			:scroll="{
				x: '100%',
				y: value.height - 36
			}"
		>
			<template #app="{ record }">
				{{ record.entity.app?.name }}
			</template>
			<template #entity="{ record }">
				{{ `${record.entity.name}(${record.entity.comment})` }}
			</template>
			<template #action="{ record }">
				{{ getActionName(record.action) }}
			</template>
			<template #scope="{ record }">
				{{ getScopeName(record.scope) }}
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
</template>

<script lang="ts" setup>
import { DeleteRoleEntity } from '@/api/manager/role/api';
import { RoleEntity } from '@/api/manager/role/type';
import { useRouter } from 'vue-router';
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { Message } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { ref } from 'vue';
import { scopes, actions } from './global';

const router = useRouter();
const emit = defineEmits(['update', 'refresh', 'pageChange', 'channel']);

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

// 处理数据删除
const handleDelete = async (id: number) => {
	await DeleteRoleEntity({ id });
	emit('refresh');
	Message.success('删除成功');
};

const operations = [
	{
		icon: 'edit',
		text: '修改权限',
		color: 'arcoblue',
		permission: 'manager:role:entity:update',
		click: (record: RoleEntity) => {
			emit('update', record);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除权限',
		color: 'red',
		permission: 'manager:role:entity:delete',
		click: (record: RoleEntity) => {
			handleDelete(record.id);
		}
	}
];

const getActionName = (action: string) => {
	for (const a of actions) {
		if (a.value === action) {
			return a.label;
		}
	}
	return action;
};

const getScopeName = (scope: string) => {
	for (const s of scopes) {
		if (s.value === scope) {
			return s.label;
		}
	}
	return scope;
};

const pageChange = (current: number) => {
	page.value.page = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};
</script>
