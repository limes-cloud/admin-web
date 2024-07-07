<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'partyaffairs:video:classify:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:pagination="false"
			:data="data"
			:bordered="false"
			:size="size"
		>
			<template #cover="{ record }">
				<a-avatar v-if="record.resource" alt="avatar" :size="38" shape="square">
					<img alt="avatar" :src="$rurl(record.resource?.url, 100, 100)" />
				</a-avatar>
				<a-avatar v-else :style="{ backgroundColor: '#3370ff' }" :size="48" shape="square">
					<span>{{ record.name }}</span>
				</a-avatar>
			</template>
			<template #status="{ record }">
				<a-tag v-if="record.status" color="arcoblue">启用</a-tag>
				<a-tag v-else color="orangered">禁用</a-tag>
			</template>
			<template #isTop="{ record }">
				<a-tag v-if="record.is_top" color="arcoblue">是</a-tag>
				<a-tag v-else color="orangered">否</a-tag>
			</template>
			<template #isTask="{ record }">
				<a-tag v-if="record.is_task" color="arcoblue">是</a-tag>
				<a-tag v-else color="orangered">否</a-tag>
			</template>
			<template #createdAt="{ record }">
				{{ $formatTime(record.created_at) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updated_at) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'partyaffairs:video:classify:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>
					<a-popconfirm content="您确认删除此应用" type="warning" @ok="emit('delete', record.id)">
						<a-tag v-permission="'partyaffairs:video:classify:delete'" color="red">
							<template #icon><icon-delete /></template>
							删除
						</a-tag>
					</a-popconfirm>
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
</template>

<script lang="ts" setup>
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { ref } from 'vue';

const emit = defineEmits(['delete', 'update', 'add', 'resetToken', 'queryToken', 'pageChange']);

const page = ref({
	current: 1,
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

const pageChange = (current: number) => {
	page.value.current = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};
</script>
