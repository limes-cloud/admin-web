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
				field="classifyId"
				label="资料分类"
				:rules="[
					{
						required: true,
						message: '资料分类是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.classifyId"
					placeholder="请选择资料分类"
					:scrollbar="true"
					:options="classifies"
					:field-names="{ value: 'id', label: 'name' }"
				/>
			</a-form-item>

			<a-form-item
				field="title"
				label="资料标题"
				:rules="[
					{
						required: true,
						message: '资料标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" allow-clear placeholder="请输入资料标题" />
			</a-form-item>

			<a-form-item
				field="description"
				label="资料简介"
				:rules="[
					{
						required: true,
						message: '资料简介是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入资料简介" />
			</a-form-item>

			<a-form-item
				field="url"
				label="资料文件"
				:rules="[
					{
						required: true,
						message: '资料文件是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<Upload
					ref="upload"
					width="100%"
					height="160px"
					:limit="1"
					:draggable="true"
					:multiple="false"
					:auto-upload="true"
					:files="files()"
					list-type="text"
					directory-path="partyaffairs/resource"
					accept="*"
					@change="handleUpload"
				></Upload>
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch, getCurrentInstance } from 'vue';
import { CreateResource, UpdateResource } from '@/api/partyaffairs/resource/api';
import { CreateResourceRequest, UpdateResourceRequest, Resource, ResourceClassify } from '@/api/partyaffairs/resource/type';
import { FileItem, Message } from '@arco-design/web-vue';

const { proxy } = getCurrentInstance() as any;
const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Resource;
	classifies: ResourceClassify[];
}>();
type Type = CreateResourceRequest | UpdateResourceRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

const files = () => {
	if (props.data.url) {
		return [
			{
				url: proxy.$rurl(props.data.url, 300, 140),
				name: '已上传文件'
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
	form.value.url = file.response.sha;
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

	if (isAdd.value) {
		const data = form.value;
		await CreateResource(data as CreateResourceRequest);
		Message.success('创建成功');
	} else {
		const data = { id: props.data.id };
		Object.keys(form.value).forEach((key) => {
			if (form.value[key] === props.data[key]) {
				return;
			}
			data[key] = form.value[key];
		});

		await UpdateResource(data as UpdateResourceRequest);
		Message.success('更新成功');
	}
	emit('refresh');

	return true;
};
</script>
