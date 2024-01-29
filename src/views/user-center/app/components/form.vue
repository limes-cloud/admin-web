<template>
	<a-drawer
		v-model:visible="visible"
		unmount-on-close
		:title="isAdd ? '新建' : '修改'"
		width="380px"
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
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
					directory-path="app/logo"
					app="UserCenter"
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
				label="应用标志"
				:rules="[
					{
						required: true,
						message: '应用标志是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" placeholder="请输入应用标志" allow-clear />
			</a-form-item>

			<a-form-item
				field="status"
				label="应用状态"
				:rules="[
					{
						required: true,
						message: '应用状态是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-radio-group v-model="form.status">
					<a-radio :value="true">启用</a-radio>
					<a-radio :value="false">停用</a-radio>
				</a-radio-group>
			</a-form-item>

			<a-form-item
				field="allow_registry"
				label="允许注册"
				:rules="[
					{
						required: true,
						message: '允许注册是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-radio-group v-model="form.allow_registry">
					<a-radio :value="true">是</a-radio>
					<a-radio :value="false">否</a-radio>
				</a-radio-group>
			</a-form-item>

			<a-form-item field="channel_ids" label="授权渠道">
				<a-select
					v-model="form.channel_ids"
					placeholder="请选择授权渠道"
					multiple
					:max-tag-count="2"
					:scrollbar="true"
					:options="channels"
					allow-search
					:field-names="{ value: 'id', label: 'name' }"
				></a-select>
			</a-form-item>

			<a-form-item
				field="description"
				label="应用描述"
				:rules="[
					{
						required: true,
						message: '应用描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" placeholder="请输入应用描述" allow-clear />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { App } from '@/api/user-center/types/app';
import { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
import { FileItem } from '@arco-design/web-vue/es/upload/interfaces';
import { ref, watch, getCurrentInstance } from 'vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: App;
	channels: SelectOptionData[];
}>();

const { proxy } = getCurrentInstance() as any;
const form = ref({ ...props.data });
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

const files = () => {
	if (props.data.resource) {
		return [
			{
				url: proxy.$rurl(props.data.resource.src, 100, 100),
				sha: props.data.resource.sha,
				name: props.data.resource.name
			}
		];
	}
	return [];
};

const handleUploadImage = (fs: FileItem[]) => {
	if (!fs || !fs.length) return;
	const file = fs[0];
	form.value.logo = file.response.sha;
};
</script>
