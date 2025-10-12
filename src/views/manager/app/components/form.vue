<template>
	<Popup v-model:visible="visible" unmount-on-close :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="right" layout="horizontal" auto-label-width>
			<a-form-item
				field="logo"
				label="应用图标"
				:rules="[
					{
						required: true,
						message: '应用图标是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<Upload
					ref="upload"
					:size="100"
					:limit="1"
					:file-size="1000"
					:draggable="true"
					:multiple="false"
					:auto-upload="true"
					:files="files()"
					directory-path="manager/app/logo"
					accept="image/*"
					@change="handleUploadImage"
				></Upload>
			</a-form-item>

			<a-form-item
				field="name"
				label="应用名称"
				:rules="[
					{
						required: true,
						message: '应用名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" placeholder="请输入应用名称" allow-clear />
			</a-form-item>

			<a-form-item
				field="keyword"
				label="应用标识"
				:rules="[
					{
						required: true,
						message: '应用标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" placeholder="请输入应用标识" allow-clear />
			</a-form-item>

			<a-form-item
				field="private"
				label="是否私有"
				:rules="[
					{
						required: true,
						message: '是否私有是必选项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-radio-group v-model="form.private">
					<a-radio :value="true">是</a-radio>
					<a-radio :value="false">否</a-radio>
				</a-radio-group>
			</a-form-item>

			<a-form-item field="extra" label="扩展信息">
				<a-textarea v-model="form.extra" placeholder="请输入扩展信息" allow-clear />
			</a-form-item>

			<a-form-item field="description" label="应用描述">
				<a-textarea v-model="form.description" placeholder="请输入应用描述" allow-clear />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { CreateApp, UpdateApp } from '@/api/manager/app/api';
import { App, CreateAppRequest, UpdateAppRequest } from '@/api/manager/app/type';
import { Message } from '@arco-design/web-vue';
import { FileItem } from '@arco-design/web-vue/es/upload/interfaces';
import { ref, getCurrentInstance } from 'vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

type Type = CreateAppRequest | UpdateAppRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);
const { proxy } = getCurrentInstance() as any;

const showAddDrawer = () => {
	visible.value = true;
	isAdd.value = true;
	form.value = {} as App;
};

const showUpdateDrawer = (data: App) => {
	visible.value = true;
	isAdd.value = false;
	form.value = { ...data } as Type;
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
			await CreateApp(data as CreateAppRequest);
			Message.success('创建成功');
		} else {
			await UpdateApp(data as UpdateAppRequest);
			Message.success('更新成功');
		}
		emit('refresh');
		return true;
	} catch (e) {
		return false;
	}
};

const files = () => {
	if (form.value.logo) {
		return [
			{
				url: proxy.$rurl(form.value.logo, 100, 100),
				key: form.value.logo
			}
		];
	}
	return [];
};

const handleUploadImage = (fs: FileItem[]) => {
	if (!fs || !fs.length) return;
	const file = fs[0];
	form.value.logo = file.response.key;
};
</script>
