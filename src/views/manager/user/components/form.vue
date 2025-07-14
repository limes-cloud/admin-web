<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" unmount-on-close @cancel="visible = false" @before-ok="handleSubmit">
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
					},
					{
						validator: phoneValidate
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
					},
					{
						type: 'email',
						message: '邮箱格式不正确'
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
				field="departmentIds"
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
					v-model="form.departmentIds"
					check-strictly
					multiple
					:options="departments"
					:field-names="{ value: 'id', label: 'name' }"
					placeholder="请选择用户部门"
					allow-search
					@focus="searchDepartment"
				/>
			</a-form-item>

			<a-form-item field="roleIds" label="用户角色" tooltip="此用户角色是为用户单独添加的特殊权限能力角色，默认不要设置">
				<a-cascader
					v-model="form.roleIds"
					multiple
					check-strictly
					:options="roles"
					placeholder="请选择用户角色"
					:field-names="{ value: 'id', label: 'name' }"
					allow-search
					@focus="searchRole"
				/>
			</a-form-item>

			<!-- <a-form-item
				field="jobIds"
				label="用户职位"
				:rules="[
					{
						required: true,
						message: '用户职位是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-cascader
					v-model="form.jobIds"
					check-strictly
					:field-names="{ value: 'id', label: 'name' }"
					:options="jobs"
					placeholder="请选择职位"
					allow-search
					@focus="searchJob"
				/>
			</a-form-item> -->
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { CreateUser, UpdateUser } from '@/api/manager/user/api';
import { CreateUserRequest, Department, Role, UpdateUserRequest, GetUserReply } from '@/api/manager/user/type';
import { ListCurrentJob, ListJob } from '@/api/manager/job/api';
import { ListCurrentDepartment } from '@/api/manager/department/api';
import { ListCurrentRole } from '@/api/manager/role/api';
import test from '@/utils/test';
import { Job } from '@/api/manager/job/type';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const props = defineProps<{
	data: GetUserReply;
}>();

const jobs = ref<Job[]>([]);
const roles = ref<Role[]>([]);
const departments = ref<Department[]>([]);
const form = ref({} as GetUserReply);
const emit = defineEmits(['refresh']);

const phoneValidate = (value, cb) => {
	if (!value) {
		cb();
		return;
	}
	if (test.mobile(value)) {
		cb();
	} else {
		cb('电话格式不正确');
	}
};

// const searchJob = async () => {
// 	const { data } = await ListCurrentJob();
// 	jobs.value = data.list;
// };

// searchJob();

const searchRole = async () => {
	const { data } = await ListCurrentRole();
	roles.value = data.list;
};
searchRole();

const searchDepartment = async () => {
	const { data } = await ListCurrentDepartment();
	departments.value = data.list;
};
searchDepartment();

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
		await CreateUser(data as CreateUserRequest);
		Message.success('创建成功');
	} else {
		await UpdateUser(data as UpdateUserRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};

watch(
	() => props.data,
	async (val) => {
		form.value = { ...val };
		if (val.roles) {
			const ids: number[] = [];
			val.roles.forEach((item) => {
				ids.push(item.id);
			});
			form.value.roleIds = ids;
		}
		if (val.jobs) {
			const ids: number[] = [];
			val.jobs.forEach((item) => {
				ids.push(item.id);
			});
			form.value.jobIds = ids;
		}
		if (val.departments) {
			const ids: number[] = [];
			val.departments.forEach((item) => {
				ids.push(item.id);
			});
			form.value.departmentIds = ids;
		}
	}
);
</script>
