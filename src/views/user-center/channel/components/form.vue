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
				label="渠道图标"
				:rules="[
					{
						required: true,
						message: '渠道图标是必填项'
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
					directory-path="channel/logo"
					app="UserCenter"
					accept="image/*"
					@change="handleUploadImage"
				></Upload>
			</a-form-item>

			<a-form-item
				field="platform"
				label="渠道类型"
				:rules="[
					{
						required: true,
						message: '渠道类型是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.platform"
					placeholder="请选择渠道类型"
					:scrollbar="true"
					:options="platforms"
					:field-names="{ value: 'platform', label: 'name' }"
					@change="handleSelectPlatform"
				></a-select>
			</a-form-item>

			<!-- 
			<a-form-item
				field="name"
				label="渠道名称"
				:rules="[
					{
						required: true,
						message: '渠道名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" placeholder="请输入渠道名称" allow-clear />
			</a-form-item>

			<a-form-item
				field="platform"
				label="渠道标识"
				:rules="[
					{
						required: true,
						message: '渠道标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.platform" placeholder="请输入渠道标识" allow-clear />
			</a-form-item> -->

			<a-form-item field="ak" label="渠道AK">
				<a-input v-model="form.ak" placeholder="请输入渠道AK" allow-clear />
			</a-form-item>

			<a-form-item field="sk" label="渠道SK">
				<a-input v-model="form.sk" placeholder="请输入渠道SK" allow-clear />
			</a-form-item>

			<a-form-item field="extra" label="扩展信息">
				<a-input v-model="form.extra" placeholder="请输入扩展信息" allow-clear />
			</a-form-item>

			<a-form-item
				field="status"
				label="渠道状态"
				:rules="[
					{
						required: true,
						message: '渠道状态是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-radio-group v-model="form.status">
					<a-radio :value="true">启用</a-radio>
					<a-radio :value="false">禁用</a-radio>
				</a-radio-group>
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { Channel, Platform } from '@/api/user-center/types/channel';
import { FileItem } from '@arco-design/web-vue/es/upload/interfaces';
import { ref, watch, getCurrentInstance } from 'vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const { proxy } = getCurrentInstance() as any;

const props = defineProps<{
	data: Channel;
	platforms: Platform[];
}>();

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

const handleSelectPlatform = () => {
	props.platforms.forEach((item) => {
		if (item.platform === form.value.platform) {
			form.value.name = item.name;
		}
	});
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
