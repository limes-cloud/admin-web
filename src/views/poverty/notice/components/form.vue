<template>
	<a-drawer
		v-model:visible="visible"
		:title="isAdd ? '新建' : '修改'"
		width="480px"
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
				field="description"
				label="通知简介"
				:rules="[
					{
						required: true,
						message: '通知简介是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入通知简介" />
			</a-form-item>

			<a-form-item field="isTop" label="是否置顶" required>
				<a-switch v-model="form.isTop" type="round">
					<template #checked>是</template>
					<template #unchecked>否</template>
				</a-switch>
			</a-form-item>

			<a-form-item
				field="content"
				label="通知内容"
				:rules="[
					{
						required: true,
						message: '通知内容是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<Tinymce v-model="form.content" allow-clear placeholder="请输入通知内容" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { CreateNotice, UpdateNotice } from '@/api/poverty/notice/api';
import { CreateNoticeRequest, UpdateNoticeRequest, Notice } from '@/api/poverty/notice/type';
import { Message } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Notice;
}>();
type Type = CreateNoticeRequest | UpdateNoticeRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

watch(
	() => props.data,
	(val) => {
		form.value = { ...val };
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
		const data = form.value;
		await CreateNotice(data as CreateNoticeRequest);
		Message.success('创建成功');
	} else {
		const data = { id: props.data.id };
		Object.keys(form.value).forEach((key) => {
			if (form.value[key] === props.data[key]) {
				return;
			}
			data[key] = form.value[key];
		});

		await UpdateNotice(data as UpdateNoticeRequest);
		Message.success('更新成功');
	}
	emit('refresh');

	return true;
};
</script>
