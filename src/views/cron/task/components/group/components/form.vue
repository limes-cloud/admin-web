<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="name"
				label="分组名称"
				:rules="[
					{
						required: true,
						message: '分组名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入分组名称" />
			</a-form-item>

			<a-form-item
				field="description"
				label="分组描述"
				:rules="[
					{
						required: true,
						message: '分组描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入分组描述" />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { CreateTaskGroupRequest, UpdateTaskGroupRequest, TaskGroup } from '@/api/cron/task/type';
import { CreateTaskGroup, UpdateTaskGroup } from '@/api/cron/task/api';
import { Message } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: TaskGroup;
}>();

type Type = CreateTaskGroupRequest | UpdateTaskGroupRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

watch(
	() => props.data,
	(val) => {
		form.value = { ...val };
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

	const data = form.value;
	if (isAdd.value) {
		await CreateTaskGroup(data as CreateTaskGroupRequest);
		Message.success('创建成功');
	} else {
		await UpdateTaskGroup(data as UpdateTaskGroupRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
