<template>
	<Popup v-model:visible="visible" title="设置角色菜单权限" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-tree
			v-model:checked-keys="ids"
			v-model:half-checked-keys="halfIds"
			:checkable="true"
			:data="menus"
			:only-check-leaf="true"
			:field-names="{
				key: 'id',
				icon: '_icon', // 这里必须改一下名字，不然会加载icon失败
				disabled: 'isHidden'
			}"
		/>
	</Popup>
</template>

<script lang="ts" setup>
import { Message } from '@arco-design/web-vue';
import { TreeNodeData } from '@arco-design/web-vue/es/tree/interface';
import { ref, watch } from 'vue';

const visible = ref(false);
const ids = ref<number[]>([]);
const halfIds = ref<number[]>([]);

const props = defineProps<{
	keys: number[];
	menus: TreeNodeData[];
}>();
const emit = defineEmits(['update']);

const handleSubmit = async () => {
	const arr = ids.value.concat(halfIds.value);
	const selects = Array.from(new Set(arr));
	if (selects.length < 1) {
		Message.error('至少选择一个菜单权限');
		return false;
	}
	emit('update', selects);
	return true;
};

const showUpdateDrawer = () => {
	visible.value = true;
};
const closeDrawer = () => {
	visible.value = false;
};

defineExpose({ showUpdateDrawer, closeDrawer });

watch(
	() => props.keys,
	(val) => {
		ids.value = val;
	},
	{ deep: true, immediate: true }
);
</script>
