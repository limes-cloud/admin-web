<template>
	<a-table
		v-permission="'manager:menu:query'"
		row-key="id"
		:loading="loading"
		:columns="columns"
		:pagination="false"
		:data="data"
		:bordered="false"
		:size="size"
	>
		<template #title="{ record }">
			<a-space>
				<Icon v-if="record.icon" :name="record.icon" />
				{{ record.title }}
			</a-space>
		</template>

		<template #isHidden="{ record }">
			<a-tag v-if="record.isHidden" color="red">隐藏</a-tag>
			<a-tag v-else color="green">显示</a-tag>
		</template>

		<template #type="{ record }">
			<a-tag v-if="record.type === 'R'" color="arcoblue">根菜单</a-tag>
			<a-tag v-if="record.type === 'M'" color="arcoblue">菜单</a-tag>
			<a-tag v-if="record.type === 'A'" color="orange">接口｜{{ record.method }}</a-tag>
			<a-tag v-if="record.type === 'G'" color="green">接口组</a-tag>
		</template>

		<template #createdAt="{ record }">
			{{ $formatTime(record.createdAt) }}
		</template>
		<template #updatedAt="{ record }">
			{{ $formatTime(record.updatedAt) }}
		</template>

		<template #operations="{ record }">
			<a-space class="cursor-pointer">
				<a-tag v-permission="'manager:menu:add'" color="arcoblue" @click="emit('add', record)">
					<template #icon><icon-plus /></template>
					新建
				</a-tag>

				<a-tag v-permission="'manager:menu:update'" color="orangered" @click="emit('update', record)">
					<template #icon><icon-edit /></template>
					修改
				</a-tag>

				<template v-if="$hasPermission('manager:menu:delete')">
					<a-popconfirm content="您确认删除此菜单" type="warning" @ok="handleDelete(record.id)">
						<a-tag color="red">
							<template #icon><icon-delete /></template>
							删除
						</a-tag>
					</a-popconfirm>
				</template>
			</a-space>
		</template>
	</a-table>
</template>

<script lang="ts" setup>
import { TableSize, TableColumn } from '@/types/global';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import Icon from '@/components/icon/index.vue';
import { DeleteMenu } from '@/api/manager/menu/api';
import { Message } from '@arco-design/web-vue';

const emit = defineEmits(['update', 'add', 'refresh']);

defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
}>();

const handleDelete = async (id: number) => {
	await DeleteMenu({ id });
	Message.success('删除成功');
	emit('refresh');
};
</script>
