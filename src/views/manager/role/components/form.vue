<template>
	<Popup v-model:visible="visible" :title="isAdd ? '创建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="parentId"
				label="父角色"
				:rules="[
					{
						required: true,
						message: '父角色是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-cascader
					v-model="form.parentId"
					check-strictly
					:options="[{ id: 0, name: '顶级角色', children: roles }]"
					:field-names="{ value: 'id', label: 'name' }"
					placeholder="请选择父角色"
					allow-search
				/>
			</a-form-item>
			<a-form-item
				field="keyword"
				:label="'角色标识'"
				:disabled="!isAdd"
				:rules="[
					{
						required: true,
						message: '角色标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" allow-clear placeholder="请输入角色标识" />
			</a-form-item>
			<a-form-item
				field="name"
				label="角色名称"
				:rules="[
					{
						required: true,
						message: '角色名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入角色名称" />
			</a-form-item>
			<a-form-item
				field="description"
				label="角色描述"
				:rules="[
					{
						required: true,
						message: '角色描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入角色描述" />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { CreateRole, UpdateRole } from '@/api/manager/role/api';
import { CreateRoleRequest, Role } from '@/api/manager/role/type';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const emit = defineEmits(['refresh']);
const props = defineProps<{
	roles?: Role[];
	data: Role;
}>();

const form = ref({} as Role);

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
		await CreateRole(data as CreateRoleRequest);
		Message.success('创建成功');
	} else {
		await UpdateRole(data);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
