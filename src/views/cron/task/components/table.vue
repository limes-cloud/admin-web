<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'cron:task:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
		>
			<template #group="{ record }">
				<template v-if="record.group">{{ record.group.name }}</template>
				<template v-else>暂无分组</template>
			</template>
			<template #status="{ record }">
				<a-tag v-if="record.status" color="arcoblue">启用</a-tag>
				<a-tag v-else color="orangered">禁用</a-tag>
			</template>
			<template #createdAt="{ record }">
				{{ $formatTime(record.created_at) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updated_at) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'cron:task:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>
					<a-popconfirm content="您确认删除此任务？" type="warning" @ok="emit('delete', record.id)">
						<a-tag v-permission="'cron:task:delete'" color="red">
							<template #icon><icon-delete /></template>
							删除
						</a-tag>
					</a-popconfirm>
					<a-dropdown position="br">
						<a-tag color="orangered">
							<template #icon><icon-more /></template>
							更多
						</a-tag>
						<template #content>
							<a-doption v-permission="'cron:task:status'">
								<a-popconfirm v-if="record.status" content="您确认要禁用此任务？" type="warning" @ok="emit('disable', record)">
									<a-tag color="red" @click.stop>
										<template #icon><icon-pause-circle /></template>
										禁用任务
									</a-tag>
								</a-popconfirm>

								<a-popconfirm v-else content="您确认要启用此任务？" type="warning" @ok="emit('enable', record)">
									<a-tag color="arcoblue" @click.stop>
										<template #icon><icon-play-circle /></template>
										启用任务
									</a-tag>
								</a-popconfirm>
							</a-doption>

							<a-doption v-permission="'cron:task:exec'">
								<a-popconfirm content="您确认要立即执行此任务？" type="warning" @ok="emit('exec', record)">
									<a-tag color="green" @click.stop>
										<template #icon><icon-play-arrow /></template>
										立即执行
									</a-tag>
								</a-popconfirm>
							</a-doption>
							<a-doption v-permission="'cron:task:log'">
								<a-tag color="pinkpurple" @click="emit('log', record)">
									<template #icon><icon-list /></template>
									执行记录
								</a-tag>
							</a-doption>
						</template>
					</a-dropdown>
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

const emit = defineEmits(['delete', 'update', 'add', 'pageChange', 'disable', 'enable', 'exec', 'log']);

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
</script>
