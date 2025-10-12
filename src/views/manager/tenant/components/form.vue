<template>
	<Popup v-model:visible="visible" unmount-on-close :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="right" layout="horizontal" auto-label-width>
			<a-form-item
				field="logo"
				label="租户图标"
				:rules="[
					{
						required: true,
						message: '租户图标是必填项'
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
					directory-path="manager/tenant/logo"
					accept="image/*"
					@change="handleUploadImage"
				></Upload>
			</a-form-item>

			<a-form-item
				field="keyword"
				label="租户标识"
				:rules="[
					{
						required: true,
						message: '租户标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" :disabled="!isAdd" placeholder="请输入租户标识" allow-clear />
			</a-form-item>

			<a-form-item
				field="name"
				label="租户名称"
				:rules="[
					{
						required: true,
						message: '租户名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" placeholder="请输入租户名称" allow-clear />
			</a-form-item>

			<a-form-item field="description" label="租户描述">
				<a-textarea v-model="form.description" placeholder="请输入租户描述" allow-clear />
			</a-form-item>

			<a-form-item
				field="weight"
				label="租户权重"
				:rules="[
					{
						required: true,
						message: '租户权重是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-number v-model="form.weight" placeholder="请输入租户权重" allow-clear />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { CreateTenant, UpdateTenant } from '@/api/manager/tenant/api';
import { Tenant, CreateTenantRequest, UpdateTenantRequest } from '@/api/manager/tenant/type';
import { Message } from '@arco-design/web-vue';
import { FileItem } from '@arco-design/web-vue/es/upload/interfaces';
import { ref, getCurrentInstance } from 'vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

type Type = CreateTenantRequest | UpdateTenantRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);
const { proxy } = getCurrentInstance() as any;

const showAddDrawer = () => {
	visible.value = true;
	isAdd.value = true;
	form.value = {} as Type;
};

const showUpdateDrawer = (data: Tenant) => {
	visible.value = true;
	isAdd.value = false;
	form.value = { ...data };
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
			await CreateTenant(data as CreateTenantRequest);
			Message.success('创建成功');
		} else {
			await UpdateTenant(data as UpdateTenantRequest);
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
