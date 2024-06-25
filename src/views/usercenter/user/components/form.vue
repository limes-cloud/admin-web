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
				field="realName"
				label="用户姓名"
				:rules="[
					{
						required: true,
						message: '用户姓名是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.realName" allow-clear placeholder="请输入用户姓名" />
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
				field="phone"
				label="用户电话"
				:rules="[
					{
						required: false,
						validator: validatePhone
					}
				]"
			>
				<a-input v-model="form.phone" allow-clear placeholder="请输入用户电话" />
			</a-form-item>

			<a-form-item
				field="email"
				label="用户邮箱"
				:rules="[
					{
						required: false,
						type: 'email',
						message: '错误的邮箱格式'
					}
				]"
			>
				<a-input v-model="form.email" allow-clear placeholder="请输入用户邮箱" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { CreateUserRequest, UpdateUserRequest, User } from '@/api/usercenter/user/type';
import { CreateUser, UpdateUser } from '@/api/usercenter/user/api';
import test from '@/utils/test';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: User;
}>();

type Type = CreateUserRequest | UpdateUserRequest;
const form = ref({ from: 'usercenter' } as Type);
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

	if (!form.value.phone && !form.value.email) {
		Message.error('邮箱和手机号至少填写一个');
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

const validatePhone = (value, cb) => {
	if (!value) {
		cb();
		return;
	}

	if (!test.mobile(value)) {
		cb('错误的电话格式');
	} else {
		cb();
	}
};
</script>
