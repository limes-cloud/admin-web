<template>
	<a-drawer
		v-model:visible="visible"
		:title="isAdd ? '新建' : '修改'"
		width="580px"
		unmount-on-close
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="title"
				label="通知标题"
				:rules="[
					{
						required: true,
						message: '通知标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" allow-clear placeholder="请输入通知标题" />
			</a-form-item>

			<a-form-item
				field="unit"
				label="发布单位"
				:rules="[
					{
						required: true,
						message: '发布单位是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.unit" allow-clear placeholder="请输入发布单位" />
			</a-form-item>

			<a-form-item
				field="desc"
				label="通知简述"
				:rules="[
					{
						required: true,
						message: '通知简述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.desc" allow-clear placeholder="请输入通知简述" />
			</a-form-item>

			<a-form-item field="is_top" label="是否置顶" required>
				<a-switch v-model="form.is_top" type="round">
					<template #checked>是</template>
					<template #unchecked>否</template>
				</a-switch>
			</a-form-item>

			<a-form-item
				field="is_send_email"
				label="发送邮件"
				:rules="[
					{
						required: true,
						message: '发送邮件是必选项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-radio-group v-model="form.is_send_email">
					<a-radio :value="true">是</a-radio>
					<a-radio :value="false">否</a-radio>
				</a-radio-group>
			</a-form-item>

			<a-form-item
				field="content"
				label="通知正文"
				:rules="[
					{
						required: true,
						message: '通知正文是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<Tinymce v-model="form.content" allow-clear placeholder="请输入通知标题" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Notice } from '@/api/partyaffairs/types/notice';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Notice;
}>();

const form = ref({ is_top: false } as Notice);
const emit = defineEmits(['add', 'update']);

watch(
	() => props.data,
	(val) => {
		if (val) {
			form.value = { ...val, is_top: !!val.is_top };
		}
	}
);

const showAddDrawer = () => {
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = async () => {
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
