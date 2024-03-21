<template>
	<a-drawer
		v-model:visible="visible"
		:title="isAdd ? '新建' : '修改'"
		width="380px"
		unmount-on-close
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="name"
				label="用户姓名"
				:rules="[
					{
						required: true,
						message: '用户姓名是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入用户姓名" />
			</a-form-item>

			<a-form-item
				field="phone"
				label="用户电话"
				:rules="[
					{
						required: true,
						message: '用户电话是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.phone" allow-clear placeholder="请输入用户电话" />
			</a-form-item>

			<a-form-item
				field="email"
				label="用户邮箱"
				:rules="[
					{
						required: true,
						message: '用户邮箱是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.email" allow-clear placeholder="请输入用户邮箱" />
			</a-form-item>

			<a-form-item
				field="gender"
				label="用户性别"
				:rules="[
					{
						required: true,
						message: '用户性别是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-radio-group v-model="form.gender">
					<template v-for="(val, key) in $genderList" :key="key">
						<a-radio :value="key">{{ val }}</a-radio>
					</template>
				</a-radio-group>
			</a-form-item>

			<a-form-item
				field="role_ids"
				label="用户角色"
				:rules="[
					{
						required: true,
						message: '用户角色是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-cascader
					v-model="form.role_ids"
					multiple
					check-strictly
					:options="[roles]"
					placeholder="请选择用户角色"
					:field-names="{ value: 'id', label: 'name' }"
					allow-search
				/>
			</a-form-item>

			<a-form-item
				field="department_id"
				label="用户部门"
				:rules="[
					{
						required: true,
						message: '用户部门是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-cascader
					v-model="form.department_id"
					check-strictly
					:options="departments"
					:field-names="{ value: 'id', label: 'name' }"
					placeholder="请选择用户部门"
					allow-search
				/>
			</a-form-item>

			<a-form-item
				field="job_ids"
				label="用户职位"
				:rules="[
					{
						required: true,
						message: '用户职位是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.job_ids"
					placeholder="请选择服务"
					:scrollbar="true"
					:options="jobs"
					:field-names="{ value: 'id', label: 'name' }"
					multiple
					@search="searchJob"
				></a-select>
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { CascaderOption } from '@arco-design/web-vue';
import { User } from '@/api/manager/types/user';
import { Job } from '@/api/manager/types/job';
import { pageJob } from '@/api/manager/job';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	departments: CascaderOption[];
	roles: CascaderOption;
	data: User;
}>();

const form = ref({} as User);
const emit = defineEmits(['add', 'update']);

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

	if (isAdd.value) {
		emit('add', { ...form.value });
	} else {
		emit('update', { ...form.value });
	}
	return true;
};

const jobs = ref<Job[]>([]);
// const current = ref<Job>();

const searchJob = async () => {
	const { data } = await pageJob({ page: 1, page_size: 50 });
	jobs.value = data.list;
};

const handleGetUserRoleIds = async (user: User) => {
	const ids: number[] = [];
	user.roles?.forEach((item) => {
		ids.push(item.id);
	});
	return ids;
};

const handleGetUserJobIds = async (user: User) => {
	const ids: number[] = [];
	user.jobs?.forEach((item) => {
		ids.push(item.id);
	});
	return ids;
};

const handlePreData = async () => {
	searchJob();
	if (isAdd.value) {
		return;
	}
	const roleIds = await handleGetUserRoleIds(props.data);
	const jobIds = await handleGetUserJobIds(props.data);
	form.value.role_ids = roleIds;
	form.value.job_ids = jobIds;
};

watch(
	() => props.data,
	async (val) => {
		form.value = val;
		await handlePreData();
	}
);
</script>
