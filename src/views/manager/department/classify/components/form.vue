<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="name"
				label="分类名称"
				:rules="[
					{
						required: true,
						message: '分类名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入分类名称" />
			</a-form-item>

			<a-form-item
				field="description"
				label="分类描述"
				:rules="[
					{
						required: true,
						message: '分类描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入分类描述" />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { CreateDepartmentClassifyRequest, UpdateDepartmentClassifyRequest, DepartmentClassify } from '@/api/manager/department/type';
import { CreateDepartmentClassify, UpdateDepartmentClassify } from '@/api/manager/department/api';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: DepartmentClassify;
}>();

type Type = CreateDepartmentClassifyRequest | UpdateDepartmentClassifyRequest;
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
		await CreateDepartmentClassify(data as CreateDepartmentClassifyRequest);
		Message.success('创建成功');
	} else {
		await UpdateDepartmentClassify(data as UpdateDepartmentClassifyRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
