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
				label="轮播标题"
				:rules="[
					{
						required: true,
						message: '轮播标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" allow-clear placeholder="请输入轮播标题" />
			</a-form-item>

			<a-form-item
				field="src"
				label="轮播封面"
				:rules="[
					{
						required: true,
						message: '轮播封面是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<Upload
					ref="upload"
					width="100%"
					height="180px"
					:limit="1"
					:draggable="true"
					:multiple="false"
					:auto-upload="true"
					:files="files()"
					directory-path="resource/banner"
					app="PartyAffairs"
					accept="image/*"
					@change="handleUploadImage"
				></Upload>
			</a-form-item>

			<a-form-item field="path" label="跳转路径">
				<a-input v-model="form.path" allow-clear placeholder="请输入应用标志" />
			</a-form-item>
			<a-form-item
				field="weight"
				label="轮播权重"
				:rules="[
					{
						required: true,
						message: '轮播权重是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-number v-model="form.weight" placeholder="请输入轮播权重" mode="button" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch, getCurrentInstance } from 'vue';
import { Banner } from '@/api/partyaffairs/types/banner';
import { FileItem } from '@arco-design/web-vue/es/upload/interfaces';

const { proxy } = getCurrentInstance() as any;
const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Banner;
}>();

const form = ref<Banner>({} as Banner);
const emit = defineEmits(['add', 'update']);
const files = () => {
	if (props.data.resource) {
		return [
			{
				url: proxy.$rurl(props.data.resource?.url, 300, 180),
				sha: props.data.resource.sha,
				name: props.data.resource.name
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

const handleUploadImage = (fs: FileItem[]) => {
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

	if (isAdd.value) {
		emit('add', { ...form.value });
	} else {
		emit('update', { ...form.value });
	}
	return true;
};
</script>
