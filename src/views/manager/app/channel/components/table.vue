<template>
	<Container>
		<a-table
			v-permission="'manager:appchannel:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:pagination="false"
			:data="data"
			:bordered="false"
			:size="size"
			:scroll="{
				x: '100%',
				y: 300
			}"
		>
			<template #logo="{ record }">
				<a-avatar v-if="record.channel.logo" alt="avatar" :size="38" shape="square">
					<img alt="avatar" :src="$rurl(record.channel.logo, 100, 100)" />
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
import { DeleteAppOAuthChannel } from '@/api/manager/app/api';
import { useRouter } from 'vue-router';
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { Message, Modal } from '@arco-design/web-vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { ref } from 'vue';
import { AppOAuthChannel } from '@/api/manager/app/type';

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
	await DeleteAppOAuthChannel({ id });
	emit('refresh');
	Message.success('删除成功');
};

const operations = [
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除渠道',
		color: 'red',
		permission: 'manager:appchannel:delete',
		click: (record: AppOAuthChannel) => {
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
