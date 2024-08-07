<template>
	<a-drawer
		v-model:visible="visible"
		:title="isAdd ? '新建' : '修改'"
		width="380px"
		unmount-on-close
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="right" layout="horizontal" auto-label-width>
			<a-form-item
				field="title"
				label="文件标题"
				:rules="[
					{
						required: true,
						message: '文件标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" allow-clear placeholder="请输入文件标题" />
			</a-form-item>

			<a-form-item
				field="src"
				label="上传文件"
				:rules="[
					{
						required: true,
						message: '文件是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<Upload
					ref="upload"
					width="100%"
					height="140px"
					:limit="1"
					:draggable="true"
					:multiple="false"
					:auto-upload="true"
					:files="files()"
					list-type="text"
					directory-path="poverty/resource"
					accept="*"
					@change="handleUpload"
				></Upload>
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { FileItem } from '@arco-design/web-vue/es/upload/interfaces';
import { CreateResource, UpdateResource } from '@/api/poverty/resource/api';
import { CreateResourceRequest, UpdateResourceRequest, Resource } from '@/api/poverty/resource/type';
import { Message } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Resource;
}>();
type Type = CreateResourceRequest | UpdateResourceRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);
const files = () => {
	if (props.data.src) {
		return [
			{
				url: props.data.url,
				name: props.data.name,
				sha: props.data.src
			}
		];
	}
	return [];
};

watch(
	() => props.data,
	(val) => {
		form.value = { ...val };
	}
);

const handleUpload = (fs: FileItem[]) => {
	if (!fs || !fs.length) return;
	const file = fs[0];
	form.value.src = file.response.sha;
};

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
		await CreateResource(data as CreateResourceRequest);
		Message.success('创建成功');
	} else {
		if (form.value.src === props.data.src) {
			data.src = undefined;
		}
		await UpdateResource(data as UpdateResourceRequest);
		Message.success('更新成功');
	}
	emit('refresh');

	return true;
};
</script>
