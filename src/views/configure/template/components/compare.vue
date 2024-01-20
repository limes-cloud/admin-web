<template>
	<div class="compare">
		<a-table
			:columns="columns"
			:pagination="false"
			:data="data"
			:bordered="false"
			:scroll="{
				x: '100%',
				y: '400px'
			}"
		>
			<template #type="{ record }">
				<a-tag v-if="record.type === 'add'" color="arcoblue">增加字段</a-tag>
				<a-tag v-if="record.type === 'del'" color="red">删除字段</a-tag>
				<a-tag v-if="record.type === 'update'" color="orange">修改字段</a-tag>
			</template>
			<template #old="{ record }">
				<a-textarea readonly :model-value="record.old"></a-textarea>
			</template>
			<template #cur="{ record }">
				<a-textarea readonly :model-value="record.cur"></a-textarea>
			</template>
		</a-table>
	</div>
</template>

<script setup lang="ts">
import { TableCloumn } from '@/types/global';
import { TableData } from '@arco-design/web-vue';
import { ref } from 'vue';

defineProps<{
	data: TableData[];
}>();

const columns = ref<TableCloumn[]>([
	{
		title: '变更类型',
		dataIndex: 'type',
		slotName: 'type',
		width: 100
	},
	{
		title: '变更字段',
		dataIndex: 'key',
		slotName: 'key',
		width: 100
	},
	{
		title: '变更前值',
		dataIndex: 'old',
		slotName: 'old'
	},
	{
		title: '变更后值',
		dataIndex: 'cur',
		slotName: 'cur'
	}
]);
</script>

<style lang="less" scoped>
.compare {
	height: 100%;
	overflow: hidden;
	border-radius: 4px;
}
</style>
