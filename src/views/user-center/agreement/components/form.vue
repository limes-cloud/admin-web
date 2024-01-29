<template>
	<a-drawer
		v-model:visible="visible"
		:title="isAdd ? '新建' : '修改'"
		width="580px"
		unmount-on-close
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="name"
				label="协议名称"
				:rules="[
					{
						required: true,
						message: '协议名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入协议名称" />
			</a-form-item>

			<a-form-item
				field="status"
				label="协议状态"
				:rules="[
					{
						required: true,
						message: '协议状态是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-radio-group v-model="form.status">
					<a-radio :value="true">启用</a-radio>
					<a-radio :value="false">禁用</a-radio>
				</a-radio-group>
			</a-form-item>

			<a-form-item
				field="description"
				label="协议描述"
				:rules="[
					{
						required: true,
						message: '协议描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入协议描述" />
			</a-form-item>

			<a-form-item
				field="content"
				label="协议内容"
				:rules="[
					{
						required: true,
						message: '协议内容是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<Tinymce v-model="form.content" allow-clear placeholder="请输入协议内容" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Agreement } from '@/api/user-center/types/agreement';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Agreement;
}>();

const form = ref({} as Agreement);
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

const showUpdateDrawer = async () => {
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
