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
				<a-input v-model="form.name" allow-clear placeholder="请输入角色名称" />
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
				field="dataScope"
				label="数据权限"
				:rules="[
					{
						required: true,
						message: '数据权限是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select v-model="form.dataScope" allow-search placeholder="数据权限">
					<template v-for="(item, index) in dataScopeTypes" :key="index">
						<a-option :value="item.value">{{ item.label }}</a-option>
					</template>
				</a-select>
			</a-form-item>

			<a-form-item
				v-if="form.dataScope === 'CUSTOM' || form.dataScope === 'ASSIGN_ALL'"
				field="depIds"
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
					v-model="form.depIds"
					:options="departments"
					:style="{ width: '320px' }"
					check-strictly
					:field-names="{ value: 'id', label: 'name' }"
					placeholder="请选择部门"
					:multiple="form.dataScope === 'CUSTOM'"
					:max-tag-count="3"
				/>
			</a-form-item>
			<!-- 
			<a-form-item
				field="jobScope"
				label="职位权限"
				:rules="[
					{
						required: true,
						message: '职位权限是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select v-model="form.jobScope" allow-search placeholder="职位权限">
					<template v-for="(item, index) in dataScopeTypes" :key="index">
						<a-option :value="item.value">{{ item.label }}</a-option>
					</template>
				</a-select>
			</a-form-item>

			<a-form-item
				v-if="form.jobScope === 'CUSTOM' || form.jobScope === 'ALL'"
				field="jids"
				label="选择职级"
				:rules="[
					{
						required: true,
						message: '请选择部门'
					}
				]"
				:validate-trigger="['change']"
			>
				<a-cascader
					v-model="form.jids"
					:options="jobs"
					:style="{ width: '320px' }"
					check-strictly
					:field-names="{ value: 'id', label: 'name' }"
					placeholder="请选择职级"
					:multiple="form.jobScope === 'CUSTOM'"
					:max-tag-count="3"
				/>
			</a-form-item> -->

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
import { computed, ref, watch } from 'vue';
import { Message, SelectOptionData, TableData } from '@arco-design/web-vue';
import { isNumber, join, split } from 'lodash';
import { CreateRole, UpdateRole } from '@/api/manager/role/api';
import { Role } from '@/api/manager/role/type';
import { Department } from '@/api/manager/department/type';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const emit = defineEmits(['refresh']);
const props = defineProps<{
	departments: Department[];
	roles?: TableData[];
	jobs: TableData[];
	data: Role;
}>();

const form = ref({} as Role & { depIds: number[] | number; jids: number[] | number });
const dataScopeTypes = computed<SelectOptionData[]>(() => [
	{
		label: '仅自己',
		value: 'SELF'
	},
	{
		label: '当前',
		value: 'CUR'
	},
	{
		label: '下级',
		value: 'DOWN'
	},
	{
		label: '当前以及下级',
		value: 'CUR_DOWN'
	},
	{
		label: '指定层级下所有',
		value: 'ASSIGN_ALL'
	},
	{
		label: '自定义',
		value: 'CUSTOM'
	}
]);

watch(
	() => props.data,
	(val) => {
		form.value = { ...val, depIds: [], jids: [] };
		const dids: number[] = [];
		if (val.departmentIds) {
			const arr = split(val.departmentIds as string, ',');
			arr.forEach((id) => {
				dids.push(Number(id));
			});
		}

		const jids: number[] = [];
		if (val.jobIds) {
			const arr = split(val.jobIds as string, ',');
			arr.forEach((id) => {
				jids.push(Number(id));
			});
		}
		form.value.depIds = dids;
		form.value.jids = jids;
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

	if (form.value.depIds) {
		if (isNumber(form.value.depIds)) {
			form.value.departmentIds = `${form.value.depIds}`;
		} else {
			form.value.departmentIds = join(form.value.depIds, ',');
		}
	}

	if (form.value.jids) {
		if (isNumber(form.value.jids)) {
			form.value.jobIds = `${form.value.jids}`;
		} else {
			form.value.jobIds = join(form.value.jids, ',');
		}
	}

	const data = form.value;
	if (isAdd.value) {
		await CreateRole(data);
		Message.success('创建成功');
	} else {
		await UpdateRole(data);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
