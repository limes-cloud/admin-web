<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" unmount-on-close @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="username"
				label="用户账号"
				:disabled="!isAdd"
				:rules="[
					{
						required: true,
						message: '用户账号是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.username" allow-clear placeholder="请输入用户账号" />
			</a-form-item>

			<a-form-item
				field="nickname"
				label="用户昵称"
				:rules="[
					{
						required: true,
						message: '用户昵称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.nickname" allow-clear placeholder="请输入用户昵称" />
			</a-form-item>

			<a-form-item
				field="deptId"
				label="所属部门"
				:rules="[
					{
						required: true,
						message: '所属部门是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-cascader
					v-model="form.deptId"
					check-strictly
					:options="depts"
					:field-names="{ value: 'id', label: 'name' }"
					placeholder="请选择用户部门"
					allow-search
				/>
			</a-form-item>

			<a-form-item
				field="jobId"
				label="担任职位"
				:rules="[
					{
						required: true,
						message: '担任职位是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.jobId"
					placeholder="请选择担任职位"
					:scrollbar="true"
					:options="jobs"
					@searchApp="searchJob.Search"
					@dropdown-reach-bottom="searchJob.NextSearch"
				/>
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { CreateUser, UpdateUser } from '@/api/manager/user/api';
import { CreateUserRequest, Dept, Role, UpdateUserRequest, GetUserReply, User } from '@/api/manager/user/type';
import { ListJob } from '@/api/manager/job/api';
import { ListCurrentDept } from '@/api/manager/dept/api';
import { Job } from '@/api/manager/job/type';
import { Result, Search } from '@/utils/search';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

type Type = CreateUserRequest & UpdateUserRequest;

const jobs = ref<Result[]>([]);
const depts = ref<Dept[]>([]);
const form = ref({} as Type);
const emit = defineEmits(['refresh']);

const searchJob = new Search(
	jobs.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListJob({ ...req, name: req.query as string | undefined });

		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return form.value.jobId === val;
	}
);

const searchDept = async () => {
	const { data } = await ListCurrentDept();
	depts.value = data.list;
};

const showAddDrawer = async () => {
	form.value = {} as Type;
	await searchDept();
	await searchJob.Search();

	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = async (user: User) => {
	form.value = { ...user };
	await searchDept();
	await searchJob.Search();

	if (!searchJob.IsExist(user.jobId)) {
		jobs.value.push({ label: user.job?.name, value: user.jobId } as Result);
	}

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
	try {
		if (isAdd.value) {
			await CreateUser(data as CreateUserRequest);
			Message.success('创建成功');
		} else {
			await UpdateUser(data as UpdateUserRequest);
			Message.success('更新成功');
		}
		emit('refresh');
		return true;
	} catch (e) {
		return false;
	}
};
</script>
