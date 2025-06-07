<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="keyword"
				label="职位标识"
				:rules="[
					{
						required: true,
						message: '职位标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" allow-clear placeholder="请输入职位标识" />
			</a-form-item>

			<a-form-item
				field="name"
				label="职位名称"
				:rules="[
					{
						required: true,
						message: '职位名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入职位名称" />
			</a-form-item>

			<a-form-item
				field="description"
				label="职位描述"
				:rules="[
					{
						required: true,
						message: '职位描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入职位描述" />
			</a-form-item>

			<a-form-item
				field="weight"
				label="职位权重"
				:rules="[
					{
						required: true,
						message: '职位权重是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-number v-model="form.weight" placeholder="请输入职位权重" :default-value="0" mode="button" />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { CreateJob, UpdateJob } from '@/api/manager/job/api';
import { Message } from '@arco-design/web-vue';
import { Job } from '@/api/manager/job/type';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Job;
}>();

const form = ref({} as Job);
const emit = defineEmits(['refresh']);

watch(
	() => props.data,
	(val) => {
		if (!val) return;
		form.value = { weight: 0, ...val };
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
		await CreateJob(data);
		Message.success('创建成功');
	} else {
		await UpdateJob(data);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
