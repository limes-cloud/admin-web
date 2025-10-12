<template>
	<Container v-slot="value">
		<a-table
			v-permission="'manager:tenantapp:query'"
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
			<template #logo="{ record }">
				<a-avatar v-if="record.app.logo" alt="avatar" :size="38" shape="square">
					<img alt="avatar" :src="$rurl(record.app.logo, 100, 100)" />
				</a-avatar>
				<a-avatar v-else :style="{ backgroundColor: '#3370ff' }" :size="48" shape="square">
					<span>{{ record.name }}</span>
				</a-avatar>
			</template>
			<template #expiredAt="{ record }">
				{{ $formatTime(record.expiredAt) }}
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
import { DeleteTenantApp, UpdateTenantApp } from '@/api/manager/tenant/api';
import { TenantApp } from '@/api/manager/tenant/type';
import { useRouter } from 'vue-router';
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { ref } from 'vue';

const router = useRouter();
const emit = defineEmits(['update', 'refresh', 'pageChange', 'channel']);

const page = ref<Pagination>({
	page: 1,
	pageSize: 10
});

const disableVisible = ref(false);
const disableForm = ref<{ disableDesc?: string }>({});
const curTenantApp = ref<TenantApp>();
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
	await DeleteTenantApp({ id });
	emit('refresh');
	Message.success('删除成功');
};

const operations = [
	{
		icon: 'edit',
		text: '修改应用',
		color: 'arcoblue',
		permission: 'manager:tenantapp:update',
		click: (record: TenantApp) => {
			emit('update', record);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除应用',
		color: 'red',
		permission: 'manager:tenantapp:delete',
		click: (record: TenantApp) => {
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
</script>
