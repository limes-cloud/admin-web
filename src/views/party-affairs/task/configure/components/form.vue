<template>
	<a-drawer v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="title"
				label="任务标题"
				:rules="[
					{
						required: true,
						message: '任务标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" allow-clear placeholder="请输入任务标题" />
			</a-form-item>

			<a-form-item
				field="desc"
				label="任务公告"
				:rules="[
					{
						required: true,
						message: '任务公告是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.desc" allow-clear placeholder="请输入任务简述" />
			</a-form-item>

			<a-form-item field="is_update" label="允许更新" required>
				<a-switch v-model="form.is_update" type="round">
					<template #checked>是</template>
					<template #unchecked>否</template>
				</a-switch>
			</a-form-item>

			<a-form-item
				label="开始时间"
				field="start"
				:rules="[
					{
						required: true,
						message: '开始时间是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-date-picker v-model="form.start" :style="{ width: '100%' }" show-time format="YYYY-MM-DD HH:mm:ss" value-format="timestamp" />
			</a-form-item>

			<a-form-item
				label="结束时间"
				field="end"
				:rules="[
					{
						required: true,
						message: '结束时间是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-date-picker v-model="form.end" :style="{ width: '100%' }" show-time format="YYYY-MM-DD HH:mm:ss" value-format="timestamp" />
			</a-form-item>

			<a-form-item
				label="任务配置"
				field="config"
				:rules="[
					{
						required: true,
						message: '任务配置是必填项'
					}
				]"
				:validate-trigger="['input']"
			>
				<a-button @click="formVisible = true">任务配置：{{ form.config ? '已配置' : '未配置' }}</a-button>
			</a-form-item>
		</a-form>
	</a-drawer>

	<a-modal
		v-model:visible="formVisible"
		:body-style="{ backgroundColor: '#f2f2f2', height: '100%', padding: '10px' }"
		fullscreen
		unmount-on-close
		@before-ok="handleFormConfig"
		@cancel="formVisible = true"
	>
		<template #title>表单配置</template>
		<FormEditor ref="formEditor" :default-components="getDefaultComponents()"></FormEditor>
	</a-modal>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Task } from '@/api/party-affairs/types/task';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const formVisible = ref(false);
const formEditor = ref();

const props = defineProps<{
	data: Task;
}>();

const form = ref<Task>({ is_update: false } as Task);
const emit = defineEmits(['add', 'update']);

watch(
	() => props.data,
	(val) => {
		form.value = { ...val, start: val.start * 1000, end: val.end * 1000 };
	}
);

const getDefaultComponents = () => {
	if (form.value.config) {
		return JSON.parse(form.value.config);
	}
	return [];
};

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

const handleFormConfig = () => {
	form.value.config = JSON.stringify(formEditor.value.getComponents());
	return true;
};

defineExpose({ showAddDrawer, showUpdateDrawer, closeDrawer });

const handleSubmit = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}
	const start = form.value.start / 1000;
	const end = form.value.end / 1000;
	if (isAdd.value) {
		emit('add', { ...form.value, start, end });
	} else {
		emit('update', { ...form.value, start, end });
	}
	return true;
};
</script>
