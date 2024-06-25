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
				label="环境标识"
				:rules="[
					{
						required: true,
						message: '环境标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" placeholder="请输入环境标识" allow-clear />
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
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Env, CreateEnvRequest, UpdateEnvRequest } from '@/api/configure/env/type';
import { CreateEnv, UpdateEnv } from '@/api/configure/env/api';
import { Message } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Env;
}>();

type Type = CreateEnvRequest | UpdateEnvRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

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

	const data = form.value;
	if (isAdd.value) {
		await CreateEnv(data as CreateEnvRequest);
		Message.success('创建成功');
	} else {
		await UpdateEnv(data as UpdateEnvRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
