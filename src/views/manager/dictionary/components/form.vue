<template>
	<a-drawer v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="keyword"
				label="字典标识"
				:rules="[
					{
						required: true,
						message: '字典标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" allow-clear placeholder="请输入字典标识" />
			</a-form-item>

			<a-form-item
				field="name"
				label="字典名称"
				:rules="[
					{
						required: true,
						message: '字典名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入字典名称" />
			</a-form-item>

			<a-form-item
				field="description"
				label="字典描述"
				:rules="[
					{
						required: true,
						message: '字典描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入字典描述" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { CreateDictionary, UpdateDictionary } from '@/api/manager/dictionary/api';
import { Message } from '@arco-design/web-vue';
import { Dictionary } from '@/api/manager/dictionary/type';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Dictionary;
}>();

const form = ref({} as Dictionary);
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
		await CreateDictionary(data);
		Message.success('创建成功');
	} else {
		await UpdateDictionary(data);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
