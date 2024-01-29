<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'uc:extra-field:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:pagination="false"
			:data="data"
			:bordered="false"
			:size="size"
		>
			<template #type="{ record }">
				{{ types[record.type] ? types[record.type] : record.type }}
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.created_at) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updated_at) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'uc:extra-field:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>
					<template v-if="$hasPermission('uc:extra-field:delete')">
						<a-popconfirm content="您确认删除此字段" type="warning" @ok="emit('delete', record.id)">
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
import { ExtraFieldType } from '@/api/user-center/types/extra-field';
import { TableSize, TableCloumn, Pagination } from '@/types/global';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';

const emit = defineEmits(['delete', 'update', 'add', 'resetToken', 'queryToken', 'pageChange']);

const page = ref({
	current: 1,
	pageSize: 10
});

const props = defineProps<{
	columns: TableCloumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	pagination: Pagination;
	total: number;
	types: ExtraFieldType[];
}>();

const types = ref({});

const handleTypes = () => {
	const data = {};
	props.types.forEach((item) => {
		data[item.type] = item.name;
	});
	types.value = data;
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

const pageChange = (current: number) => {
	page.value.current = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};
</script>
