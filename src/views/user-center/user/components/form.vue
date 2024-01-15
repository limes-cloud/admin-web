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
				field="real_name"
				label="用户姓名"
				:rules="[
					{
						required: true,
						message: '用户姓名是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.real_name" allow-clear placeholder="请输入用户姓名" />
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

			<a-form-item field="phone" label="用户电话">
				<a-input v-model="form.phone" allow-clear placeholder="请输入用户电话" />
			</a-form-item>

			<a-form-item field="email" label="用户邮箱">
				<a-input v-model="form.email" allow-clear placeholder="请输入用户邮箱" />
			</a-form-item>

			<a-form-item field="id_card" label="身份证号">
				<a-input v-model="form.id_card" allow-clear placeholder="请输入身份证号" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { User } from '@/api/user-center/types/user';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: User;
}>();

const form = ref({ form: 'user-center' } as User);
const emit = defineEmits(['add', 'update']);

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

	if (isAdd.value) {
		emit('add', { ...form.value });
	} else {
		emit('update', { ...form.value });
	}
	return true;
};
</script>
