<template>
	<a-row v-permission="'manager:user:query'">
		<a-col :flex="1">
			<a-form ref="formRef" :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="6">
						<a-form-item field="team_id" label="用户角色">
							<a-cascader
								v-model="form.roleId"
								check-strictly
								allow-clear
								:options="roles"
								:field-names="{ value: 'id', label: 'name' }"
								placeholder="请选择用户角色"
								allow-search
							/>
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item field="department_id" label="用户部门">
							<a-cascader
								v-model="form.departmentId"
								allow-clear
								check-strictly
								:options="departments"
								:field-names="{ value: 'id', label: 'name' }"
								placeholder="请选择用户部门"
								allow-search
							/>
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item field="name" label="用户姓名">
							<a-input v-model="form.name" allow-clear placeholder="请输入用户姓名" />
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item
							field="phone"
							label="用户电话"
							:validate-trigger="['change', 'input']"
							:rules="[
								{
									validator: phoneValidate
								}
							]"
						>
							<a-input v-model="form.phone" allow-clear placeholder="请输入用户电话" />
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item
							field="email"
							label="用户邮箱"
							:validate-trigger="['change', 'input']"
							:rules="[
								{
									type: 'email',
									required: false,
									message: '邮箱地址不正确'
								}
							]"
						>
							<a-input v-model="form.email" allow-clear placeholder="请输入用户邮箱" />
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item field="status" label="用户状态">
							<a-select v-model="form.status" allow-search allow-clear placeholder="用户状态">
								<a-option :value="true">启用</a-option>
								<a-option :value="false">禁用</a-option>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="createdTime" label="创建时间">
							<a-range-picker v-model="form.createdAts" value-format="timestamp" style="width: 100%" allow-clear />
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="createdTime" label="登陆时间">
							<a-range-picker v-model="form.loggedAts" value-format="timestamp" style="width: 100%" allow-clear />
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-col>
		<a-divider style="height: 84px" direction="vertical" />
		<a-col :flex="'86px'" style="text-align: right">
			<a-space direction="vertical" :size="18">
				<a-button type="primary" @click="handleSearch">
					<template #icon>
						<icon-search />
					</template>
					搜索
				</a-button>
				<a-button @click="reset">
					<template #icon>
						<icon-refresh />
					</template>
					重置
				</a-button>
			</a-space>
		</a-col>
	</a-row>
</template>

<script lang="ts" setup>
import { ListDepartment } from '@/api/manager/department/api';
import { ListRole } from '@/api/manager/role/api';
import { Department, ListUserRequest, Role } from '@/api/manager/user/type';
import { ref } from 'vue';
import test from '@/utils/test';

const formRef = ref();
const form = ref({} as ListUserRequest);
const emit = defineEmits(['search']);

const roles = ref<Role[]>([]);
const departments = ref<Department[]>([]);

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

const searchRole = async () => {
	const { data } = await ListRole();
	roles.value = data.list;
};
searchRole();

const searchDepartment = async () => {
	const { data } = await ListDepartment();
	departments.value = data.list;
};
searchDepartment();

const handleSearch = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}

	const params = { ...form.value };
	if (params.createdAts) {
		if (params.createdAts[0]) {
			params.createdAts[0] /= 1000;
		}
		if (params.createdAts[1]) {
			params.createdAts[1] /= 1000;
		}
	}

	if (params.loggedAts) {
		if (params.loggedAts[0]) {
			params.loggedAts[0] /= 1000;
		}
		if (params.loggedAts[1]) {
			params.loggedAts[1] /= 1000;
		}
	}

	emit('search', form.value);
	return true;
};

const reset = () => {
	form.value = {} as ListUserRequest;
};
</script>
