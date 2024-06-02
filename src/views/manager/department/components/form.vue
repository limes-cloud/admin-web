<template>
	<a-drawer v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="parentId"
				label="上级部门"
				:rules="[
					{
						required: true,
						message: '上级部门是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-cascader
					v-model="form.parentId"
					check-strictly
					:field-names="{ value: 'id', label: 'name' }"
					:options="departments"
					placeholder="请选择上级部门"
					allow-search
				/>
			</a-form-item>

			<a-form-item
				field="name"
				label="部门名称"
				:rules="[
					{
						required: true,
						message: '部门名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" placeholder="请输入部门名称" allow-clear />
			</a-form-item>

			<a-form-item
				field="keyword"
				label="部门标志"
				:rules="[
					{
						required: true,
						message: '部门标志是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" placeholder="请输入部门标志" allow-clear />
			</a-form-item>

			<a-form-item
				field="description"
				label="部门描述"
				:rules="[
					{
						required: true,
						message: '部门描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" placeholder="请输入部门描述" allow-clear />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Message, TableData } from '@arco-design/web-vue';
import { CreateDepartment, UpdateDepartment } from '@/api/manager/department/api';
import { Department } from '@/api/manager/department/type';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	departments?: TableData[];
	data: Department;
}>();

const form = ref({} as Department);
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
		await CreateDepartment(data);
		Message.success('创建成功');
	} else {
		await UpdateDepartment(data);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
