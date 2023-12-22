<template>
	<a-drawer v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="name"
				label="环境名称"
				:rules="[
					{
						required: true,
						message: '环境名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" placeholder="请输入环境名称" allow-clear />
			</a-form-item>

			<a-form-item
				field="keyword"
				label="环境标志"
				:rules="[
					{
						required: true,
						message: '环境标志是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" placeholder="请输入环境标志" allow-clear />
			</a-form-item>

			<a-form-item
				field="description"
				label="环境描述"
				:rules="[
					{
						required: true,
						message: '环境描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" placeholder="请输入环境描述" allow-clear />
			</a-form-item>

			<a-form-item
				v-if="!isAdd"
				field="status"
				label="环境状态"
				:rules="[
					{
						required: true,
						message: '环境状态是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-radio-group v-model="form.status">
					<a-radio :value="true">启用</a-radio>
					<a-radio :value="false">禁用</a-radio>
				</a-radio-group>
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { Env } from '@/api/configure/types/env';
import { ref, watch } from 'vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Env;
}>();

const form = ref({ ...props.data });
const emit = defineEmits(['add', 'update']);

watch(
	() => props.data,
	(val) => {
		form.value = val;
	}
);

const showAddDrawer = () => {
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = () => {
	visible.value = true;
	isAdd.value = false;
};

const closeDrawer = () => {
	visible.value = false;
};

defineExpose({ showAddDrawer, showUpdateDrawer, closeDrawer });

const handleSubmit = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}

	if (isAdd.value) {
		emit('add', { ...form.value });
	} else {
		emit('update', { ...form.value });
	}
	return true;
};
</script>
