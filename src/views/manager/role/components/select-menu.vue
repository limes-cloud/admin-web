<template>
	<a-drawer v-model:visible="visible" title="设置角色菜单权限" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-tree
			v-model:checked-keys="ids"
			v-model:half-checked-keys="halfIds"
			:checkable="true"
			:data="menus"
			:only-check-leaf="true"
			:field-names="{
				key: 'id',
				icon: '_icon', // 这里必须改一下名字，不然会加载icon失败
				disabled: 'is_hidden'
			}"
		/>
	</a-drawer>
</template>

<script lang="ts" setup>
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
	const res = ids.value.concat(halfIds.value);
	emit('update', res);
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
