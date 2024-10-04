<template>
	<a-modal v-model:visible="visible" hide-title :width="700" hide-cancel @cancel="visible = false">
		<a-table :columns="appColumns" :pagination="false" :data="list" :bordered="false">
			<template #value="{ record }">
				<template v-if="record.fileType == 'video'">
					<video :src="record.resource.url" controls style="width: 200px; height: 100px"></video>
				</template>
				<template v-if="record.fileType == 'audio'">
					<audio :src="record.resource.url" style="width: 200px; height: 100px"></audio>
				</template>
				<template v-if="record.fileType == 'image'">
					<a-image :src="record.resource.url" height="100px" width="100px"></a-image>
				</template>
				<template v-if="!record.fileType">{{ record.value }}</template>
			</template>
		</a-table>
	</a-modal>
</template>

<script lang="ts" setup>
import { TableColumn } from '@/types/global';
import { watch, ref } from 'vue';

const list = ref<any[]>([]);
const props = defineProps<{
	data: any[];
}>();

watch(
	() => props.data,
	(val) => {
		list.value = val;
	},
	{ immediate: true, deep: true }
);
const visible = ref(false);

const appColumns = ref<TableColumn[]>([
	{
		title: '标题',
		dataIndex: 'label',
		slotName: 'label'
	},
	{
		title: '值',
		dataIndex: 'value',
		slotName: 'value'
	}
]);

const show = () => {
	visible.value = true;
};

const close = () => {
	visible.value = false;
};

defineExpose({ show, close });
</script>

<style lang="less" scoped>
.content {
	height: 350px;
	overflow-y: scroll;
}
</style>
