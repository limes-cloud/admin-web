<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'partyaffairs:banner:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
		>
			<template #src="{ record }">
				<img alt="avatar" :src="$rurl(record.resource?.url, 200, 100)" />
			</template>

			<template #jump="{ record }">
				{{ record.app || record.url ? '是' : '否' }}
			</template>
			<template #jumpInfo="{ record }">
				<template v-if="record.app || record.url">
					{{ record.app ? record.app + '|' + record.params : record.url }}
				</template>
				<template v-else>暂无</template>
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.created_at) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updated_at) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'partyaffairs:banner:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<a-popconfirm v-permission="'partyaffairs:banner:delete'" content="您确认删除此板块" type="warning" @ok="emit('delete', record.id)">
						<a-tag color="red">
							<template #icon><icon-delete /></template>
							删除
						</a-tag>
					</a-popconfirm>
				</a-space>
			</template>
		</a-table>
	</a-space>
</template>

<script lang="ts" setup>
import { TableColumn } from '@/types/global';
import { TableData } from '@arco-design/web-vue/es/table/interface';

const emit = defineEmits(['delete', 'update', 'add']);
defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
}>();
</script>
