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
				field="description"
				label="任务公告"
				:rules="[
					{
						required: true,
						message: '任务公告是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入任务简述" />
			</a-form-item>

			<a-form-item
				field="isUpdate"
				label="允许更新"
				:rules="[
					{
						required: true,
						message: '允许更新是必填项'
					}
				]"
			>
				<a-switch v-model="form.isUpdate" type="round">
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
import { CreateTaskRequest, Task, UpdateTaskRequest } from '@/api/partyaffairs/task/type';
import { CreateTask, UpdateTask } from '@/api/partyaffairs/task/api';
import Message from '@arco-design/web-vue/es/message';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const formVisible = ref(false);
const formEditor = ref();

const props = defineProps<{
	data: Task;
}>();

const form = ref<Task>({} as Task);
const emit = defineEmits(['refresh']);

watch(
	() => props.data,
	(val) => {
		form.value = { ...val };
		if (val.start) {
			form.value.start = val.start * 1000;
			form.value.end = val.end * 1000;
		}
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
	const formValue = { ...form.value };
	if (formValue.start) {
		formValue.start = Math.floor(formValue.start / 1000);
	}
	if (formValue.end) {
		formValue.end = Math.floor(formValue.end / 1000);
	}
	if (isAdd.value) {
		const data = formValue;
		await CreateTask(data as CreateTaskRequest);
		Message.success('创建成功');
	} else {
		const data = { id: props.data.id };
		Object.keys(formValue).forEach((key) => {
			if (formValue[key] === props.data[key]) {
				return;
			}
			data[key] = formValue[key];
		});
		await UpdateTask(data as UpdateTaskRequest);
		Message.success('更新成功');
	}
	emit('refresh');

	return true;
};
</script>
