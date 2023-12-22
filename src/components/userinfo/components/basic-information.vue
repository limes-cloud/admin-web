<template>
	<a-form ref="formRef" :model="formData" class="form" auto-label-width>
		<a-form-item
			field="nickname"
			label="昵称"
			:rules="[
				{
					required: true,
					message: '昵称是必填项'
				}
			]"
		>
			<a-input v-model="formData.nickname" :max-length="15" placeholder="请输入昵称" />
		</a-form-item>

		<a-form-item
			field="gender"
			label="性别"
			:rules="[
				{
					required: true,
					message: '性别是必填项'
				}
			]"
		>
			<a-select v-model="formData.gender" allow-search placeholder="请选择">
				<template v-for="(item, index) in $genderList" :key="index">
					<a-option :value="index">{{ item }}</a-option>
				</template>
			</a-select>
		</a-form-item>

		<a-form-item>
			<a-space>
				<a-button type="primary" @click="validate">保存</a-button>
			</a-space>
		</a-form-item>
	</a-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { FormInstance } from '@arco-design/web-vue/es/form';
import { useUserStore } from '@/store';
import Message from '@arco-design/web-vue/es/message';
import { updateUserBasic } from '@/api/manager/user';

const userInfo = useUserStore();

const formRef = ref<FormInstance>();
const formData = ref<any>({
	nickname: userInfo.nickname,
	gender: userInfo.gender
});

const validate = async () => {
	const res = await formRef.value?.validate();
	if (!res) {
		await updateUserBasic({ ...formData.value });
		Message.success('基础信息更新成功');
		userInfo.info();
	}
};
</script>

<style scoped lang="less">
.form {
	max-width: 540px;
}
</style>
