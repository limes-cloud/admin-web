<template>
	<a-table
		v-permission="'uc:channel:query'"
		row-key="id"
		:loading="loading"
		:columns="columns"
		:pagination="false"
		:data="data"
		:bordered="false"
		:size="size"
	>
		<template #logo="{ record }">
			<a-avatar v-if="record.resource" alt="avatar" :size="38" shape="square">
				<img alt="avatar" :src="$rurl(record.resource.src, 100, 100)" />
			</a-avatar>
			<a-avatar v-else :style="{ backgroundColor: '#3370ff' }" :size="48" shape="square">
				<span>{{ record.platform }}</span>
			</a-avatar>
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
				<a-tag v-permission="'uc:channel:update'" color="orangered" @click="emit('update', record)">
					<template #icon><icon-edit /></template>
					修改
				</a-tag>

				<template v-if="$hasPermission('uc:channel:delete')">
					<a-popconfirm content="您确认删除此渠道" type="warning" @ok="emit('delete', record.id)">
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
import { TableSize, TableCloumn } from '@/types/global';
import { TableData } from '@arco-design/web-vue/es/table/interface';

const emit = defineEmits(['delete', 'update', 'add']);

defineProps<{
	columns: TableCloumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
}>();
</script>
