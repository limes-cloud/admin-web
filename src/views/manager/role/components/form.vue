<template>
	<a-drawer v-model:visible="visible" :title="isAdd ? '创建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="formData" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="parent_id"
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
					v-model="formData.parent_id"
					check-strictly
					:options="roles"
					:field-names="{ value: 'id', label: 'name' }"
					placeholder="请选择父角色"
					allow-search
				/>
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
				<a-input v-model="formData.name" allow-clear placeholder="请输入角色名称" />
			</a-form-item>
			<a-form-item
				field="keyword"
				:label="'角色标识'"
				:rules="[
					{
						required: true,
						message: '角色标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="formData.keyword" allow-clear placeholder="请输入角色标识" />
			</a-form-item>
			<a-form-item
				field="status"
				label="角色状态"
				:rules="[
					{
						required: true,
						message: '角色状态是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-radio-group v-model="formData.status" :default-value="true">
					<a-radio :value="true">启用</a-radio>
					<a-radio :value="false">禁用</a-radio>
				</a-radio-group>
			</a-form-item>
			<a-form-item
				field="data_scope"
				label="数据权限"
				:rules="[
					{
						required: true,
						message: '数据权限是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select v-model="formData.data_scope" allow-search placeholder="数据权限">
					<template v-for="(item, index) in dataScopeTypes" :key="index">
						<a-option :value="item.value">{{ item.label }}</a-option>
					</template>
				</a-select>
			</a-form-item>

			<a-form-item
				v-if="formData.data_scope === 'CUSTOM'"
				field="department_ids"
				label="选择部门"
				:rules="[
					{
						required: true,
						message: '请选择部门'
					}
				]"
				:validate-trigger="['change']"
			>
				<a-cascader
					:options="departments"
					:default-value="formData.department_ids"
					:style="{ width: '320px' }"
					check-strictly
					:field-names="{ value: 'id', label: 'name' }"
					placeholder="请选择部门"
					multiple
					:max-tag-count="3"
				/>
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
				<a-textarea v-model="formData.description" allow-clear placeholder="请输入角色描述" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { Role } from '@/api/manager/types/role';
import { computed, ref, watch } from 'vue';
import { SelectOptionData, TableData } from '@arco-design/web-vue';
import { Department } from '@/api/manager/types/department';
import { join, split } from 'lodash';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	departments: Department[];
	roles?: TableData[];
	data: Role;
}>();

const formData = ref({ ...props.data });
const emit = defineEmits(['add', 'update']);
const dataScopeTypes = computed<SelectOptionData[]>(() => [
	{
		label: '所有部门',
		value: 'ALL'
	},
	{
		label: '当前部门',
		value: 'CUR'
	},
	{
		label: '当前部门以及下级部门',
		value: 'CUR_DOWN'
	},
	{
		label: '下级部门',
		value: 'DOWN'
	},
	{
		label: '自定义',
		value: 'CUSTOM'
	}
]);

watch(
	() => props.data,
	(val) => {
		formData.value = { ...val };
		const ids: number[] = [];
		if (val.department_ids) {
			const arr = split(val.department_ids as string, ',');
			arr.forEach((id) => {
				ids.push(Number(id));
			});
		}
		formData.value.department_ids = ids;
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

	if (formData.value.department_ids) {
		formData.value.department_ids = join(formData.value.department_ids, ',');
	}

	if (isAdd.value) {
		emit('add', { ...formData.value });
	} else {
		emit('update', { ...formData.value });
	}
	return true;
};
</script>
