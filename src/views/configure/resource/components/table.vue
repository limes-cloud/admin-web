<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'configure:resource:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:pagination="false"
			:data="data"
			:bordered="false"
			:size="size"
		>
			<template #fields="{ record }">
				<a-space>
					<template v-for="(field, index) in getFields(record.fields)" :key="index">
						<a-tag color="arcoblue">{{ field }}</a-tag>
					</template>
				</a-space>
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updatedAt) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'configure:resource:value:query'" color="arcoblue" @click="emit('set', record)">
						<template #icon><icon-edit /></template>
						配置
					</a-tag>

					<a-tag v-permission="'configure:resource:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<template v-if="$hasPermission('configure:resource:delete')">
						<a-popconfirm content="您确认删除此资源变量？" type="warning" @ok="handleDelete(record.id)">
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
</template>

<script lang="ts" setup>
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { ref } from 'vue';
import { DeleteResource } from '@/api/configure/resource/api';
import { Message } from '@arco-design/web-vue';

const emit = defineEmits(['refresh', 'update', 'add', 'set', 'pageChange']);

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

const pageChange = (value: number) => {
	page.value.page = value;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};

const handleDelete = async (id: number) => {
	await DeleteResource({ id });
	Message.success('删除成功');
	emit('refresh');
};

const getFields = (field: string) => {
	const list = field.split(',');
	if (list.length > 3) {
		return list.slice(0, 3).concat(['...']);
	}
	return list;
};
</script>
