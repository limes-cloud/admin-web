<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="parentId"
				label="上级职位"
				:rules="[
					{
						required: true,
						message: '上级职位是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-cascader
					v-model="form.parentId"
					check-strictly
					:field-names="{ value: 'id', label: 'name' }"
					:options="jobs"
					placeholder="请选择上级职位"
					allow-search
				/>
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
				<a-input v-model="form.name" placeholder="请输入职位名称" allow-clear />
			</a-form-item>

			<a-form-item
				field="keyword"
				label="职位标志"
				:rules="[
					{
						required: true,
						message: '职位标志是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" placeholder="请输入职位标志" allow-clear />
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
				<a-textarea v-model="form.description" placeholder="请输入职位描述" allow-clear />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Message, TableData } from '@arco-design/web-vue';
import { CreateJob, UpdateJob } from '@/api/manager/job/api';
import { Job } from '@/api/manager/job/type';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

defineProps<{
	jobs?: TableData[];
}>();

const form = ref({} as Job);
const emit = defineEmits(['refresh']);

const showAddDrawer = (data: Job) => {
	form.value = { ...data };

	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = (data: Job) => {
	form.value = { ...data };

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
