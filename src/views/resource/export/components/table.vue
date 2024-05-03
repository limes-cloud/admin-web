<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'resource:export:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
		>
			<template #status="{ record }">
				<a-tag v-if="record.status == 'finish'" color="green" @click="emit('update', record)">
					<template #icon><icon-check-circle-fill /></template>
					完成
				</a-tag>

				<a-tag v-if="record.status == 'process'" color="orange" @click="emit('update', record)">
					<template #icon><icon-loading /></template>
					进行中
				</a-tag>

				<a-tooltip :content="record.reason" position="top" mini>
					<a-tag v-if="record.status == 'fail'" color="red" @click="emit('update', record)">
						<template #icon><icon-close-circle-fill /></template>
						失败
					</a-tag>
				</a-tooltip>

				<a-tag v-if="record.status == 'pinkpurple'" color="red" @click="emit('update', record)">
					<template #icon><icon-exclamation-circle-fill /></template>
					已过期
				</a-tag>
			</template>

			<template #size="{ record }">
				{{ getFileSize(record.size) }}
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.created_at) }}
			</template>

			<template #updatedAt="{ record }">
				{{ $formatTime(record.updated_at) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-popconfirm content="您确认要下载此文件？" @ok="handleDownloadFile($rurl(record.src), record.name)">
						<a-tag color="arcoblue">
							<template #icon><icon-download /></template>
							下载
						</a-tag>
					</a-popconfirm>
					<a-popconfirm content="您确认删除此字典" type="warning" @ok="emit('delete', record.id)">
						<a-tag v-permission="'resource:export:delete'" color="red">
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
import { TableSize, TableCloumn, Pagination } from '@/types/global';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';
import { getFileSize } from '@/utils';

const emit = defineEmits(['delete', 'update', 'add', 'value', 'pageChange']);

const props = defineProps<{
	columns: TableCloumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	pagination: Pagination;
	total: number;
}>();

const page = ref({
	current: 1,
	pageSize: 10
});

watch(
	() => props.pagination,
	(val) => {
		page.value = { ...val };
	},
	{ deep: true, immediate: true }
);

const pageChange = (current: number) => {
	page.value.current = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};

const handleDownloadFile = (src: string, name: string) => {
	const link = document.createElement('a');
	link.href = `${src}?download=true&save_name=${name}`;
	link.target = '_blank';
	link.download = src.substring(src.lastIndexOf('/'));
	link.click();
};
</script>
