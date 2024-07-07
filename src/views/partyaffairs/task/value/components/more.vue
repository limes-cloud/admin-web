<template>
	<a-modal v-model:visible="visible" hide-title :width="700" hide-cancel @cancel="visible = false">
		<a-table :columns="appColumns" :pagination="false" :data="list" :bordered="false">
			<template #value="{ record }">
				<template v-if="record.resource">
					<Upload
						ref="upload"
						aria-readonly="true"
						width="100px"
						height="100px"
						:limit="1"
						:draggable="true"
						:multiple="false"
						:auto-upload="true"
						:files="files(record.resource)"
						directory-path="resource/banner"
						app="PartyAffairs"
						accept="image/*"
					></Upload>
				</template>
				<view v-else>{{ record.value }}</view>
			</template>
		</a-table>
	</a-modal>
</template>

<script lang="ts" setup>
import { Resource, TableColumn } from '@/types/global';
import { watch, ref, getCurrentInstance } from 'vue';

const { proxy } = getCurrentInstance() as any;
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

const files = (resource: Resource) => {
	if (resource) {
		return [
			{
				url: proxy.$rurl(resource?.url, 300, 180),
				sha: resource.sha,
				name: resource.name
			}
		];
	}
	return [];
};

defineExpose({ show, close });
</script>

<style lang="less" scoped>
.content {
	height: 350px;
	// overflow-y: scroll;
}
</style>
