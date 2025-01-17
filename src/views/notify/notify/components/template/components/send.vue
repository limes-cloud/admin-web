<template>
	<a-drawer
		v-model:visible="visible"
		:title="getTypeName(ctype) + '发送测试'"
		width="380px"
		unmount-on-close
		ok-text="发送"
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				v-if="ctype === 'email'"
				field="user.email"
				label="邮箱地址"
				:rules="[
					{
						required: true,
						message: '邮箱地址是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.user.email" allow-clear placeholder="请输入邮箱地址" />
			</a-form-item>
			<a-form-item
				v-if="ctype === 'official_account'"
				field="user.officialOpenid"
				label="公众号openid"
				:rules="[
					{
						required: true,
						message: '微信公众号openid是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.user.officialOpenid" allow-clear placeholder="请输入微信公众号openid" />
			</a-form-item>
			<a-divider orientation="left">模板变量</a-divider>
			<template v-for="key in notify?.variable" :key="key">
				<a-form-item :label="key">
					<a-input v-model="form.variable[key]" allow-clear placeholder="请输入通知变量" />
				</a-form-item>
			</template>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { Template } from '@/api/notify/template/type';
import { GetNotify, SendNotify } from '@/api/notify/notify/api';
import { Notify, SendNotifyRequest } from '@/api/notify/notify/type';

import { ref } from 'vue';
import Message from '@arco-design/web-vue/es/message';

const formRef = ref();
const form = ref<SendNotifyRequest>({ user: {}, variable: {}, fromServer: 'system-test' } as SendNotifyRequest);
const visible = ref(false);
const ctype = ref('');
const notify = ref<Notify>();

const handleGetNotify = async (id: number) => {
	const { data } = await GetNotify({ id });
	notify.value = data;
	form.value.notify = data.keyword;
};

const getTypeName = (tp: string) => {
	switch (tp) {
		case 'email':
			return '邮件';
		case 'sms':
			return '短信';
		default:
			return '';
	}
};

const showShowDrawer = (data: Template) => {
	ctype.value = data.channel.type;
	handleGetNotify(data.notifyId);

	visible.value = true;
};

const closeDrawer = () => {
	visible.value = false;
};

defineExpose({ showShowDrawer, closeDrawer });

const handleSubmit = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}
	form.value.timestamp = Math.floor(Date.now() / 1000);
	await SendNotify(form.value);
	Message.success('发送成功');
	return true;
};
</script>
