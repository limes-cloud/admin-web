<template>
	<Container v-slot="value">
		<a-table
			v-permission="'manager:menu:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:pagination="false"
			:data="data"
			:bordered="false"
			:size="size"
			:scroll="{ x: '100%', y: value.height - 36 }"
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
					<Operation :data="record" :list="operations"></Operation>
				</a-space>
			</template>
		</a-table>
	</Container>
</template>

<script lang="ts" setup>
import { TableSize, TableColumn } from '@/types/global';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import Icon from '@/components/icon/index.vue';
import { DeleteMenu } from '@/api/manager/menu/api';
import { Message } from '@arco-design/web-vue';
import { Menu } from '@/api/manager/menu/type';

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

const operations = [
	{
		icon: 'plus',
		text: '新建菜单',
		color: 'arcoblue',
		permission: 'manager:menu:add',
		click: (record: Menu) => {
			emit('add', record);
		}
	},
	{
		icon: 'edit',
		text: '修改菜单',
		color: 'arcoblue',
		permission: 'manager:menu:update',
		click: (record: Menu) => {
			emit('update', record);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除菜单',
		color: 'red',
		permission: 'manager:menu:delete',
		click: (record: Menu) => {
			handleDelete(record.id);
		}
	}
];
</script>
