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
					height="140px"
					:limit="1"
					:draggable="true"
					:multiple="false"
					:auto-upload="true"
					:files="files()"
					directory-path="poverty/banner"
					accept="image/*"
					@change="handleUploadImage"
				></Upload>
			</a-form-item>

			<a-form-item field="path" label="跳转路径">
				<a-input v-model="form.path" allow-clear placeholder="请输入跳转路径" />
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
import { FileItem } from '@arco-design/web-vue/es/upload/interfaces';
import { CreateBanner, UpdateBanner } from '@/api/poverty/banner/api';
import { CreateBannerRequest, UpdateBannerRequest, Banner } from '@/api/poverty/banner/type';
import { Message } from '@arco-design/web-vue';

const { proxy } = getCurrentInstance() as any;
const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Banner;
}>();
type Type = CreateBannerRequest | UpdateBannerRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);
const files = () => {
	if (props.data.src) {
		return [
			{
				url: proxy.$rurl(props.data.src, 300, 140)
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

	const data = form.value;
	if (isAdd.value) {
		await CreateBanner(data as CreateBannerRequest);
		Message.success('创建成功');
	} else {
		if (form.value.src === props.data.src) {
			data.src = undefined;
		}
		await UpdateBanner(data as UpdateBannerRequest);
		Message.success('更新成功');
	}
	emit('refresh');

	return true;
};
</script>
