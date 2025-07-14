<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
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
				field="classifyId"
				label="部门分类"
				:rules="[
					{
						required: true,
						message: '部门分类是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.classifyId"
					placeholder="请选择部门分类"
					:scrollbar="true"
					:options="classifies"
					@search="search.Search"
					@dropdown-reach-bottom="search.NextSearch"
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
				field="roleIds"
				label="部门角色"
				:rules="[
					{
						required: true,
						message: '部门角色是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-cascader
					v-model="form.roleIds"
					multiple
					check-strictly
					:options="roles"
					placeholder="请选择部门角色"
					:field-names="{ value: 'id', label: 'name' }"
					allow-search
					@focus="searchRole"
				/>
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
	</Popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Message, TableData } from '@arco-design/web-vue';
import { CreateDepartment, ListDepartmentClassify, UpdateDepartment } from '@/api/manager/department/api';
import { Department, Role } from '@/api/manager/department/type';
import { Result, Search } from '@/utils/search';
import { ListCurrentRole } from '@/api/manager/role/api';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const classifies = ref<Result[]>([]);

const props = defineProps<{
	departments?: TableData[];
}>();

const form = ref({} as Department);
const emit = defineEmits(['refresh']);

const roles = ref<Role[]>([]);

const searchRole = async () => {
	const { data } = await ListCurrentRole();
	roles.value = data.list;
};

searchRole();

const search = new Search(
	classifies.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListDepartmentClassify({ ...req, name: req.query as string | undefined });

		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return form.value.classifyId === val;
	}
);

const showAddDrawer = (data: Department) => {
	form.value = { ...data };

	search.Search();
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = (data: Department) => {
	if (data.roles) {
		data.roleIds = data.roles.map((item) => item.id);
	}
	if (!search.IsExist(data.classifyId)) {
		classifies.value.push({ label: data.classify.name, value: data.classify.id } as Result);
	}

	form.value = { ...data };
	search.Search();
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
