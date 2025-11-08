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
				label="公开分类"
				:rules="[
					{
						required: true,
						message: '公开分类是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.classifyId"
					placeholder="请选择公开分类"
					:scrollbar="true"
					:options="classifies"
					:field-names="{ value: 'id', label: 'name' }"
				/>
			</a-form-item>

			<a-form-item
				field="title"
				label="公开标题"
				:rules="[
					{
						required: true,
						message: '公开标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" allow-clear placeholder="请输入公开标题" />
			</a-form-item>

			<a-form-item
				field="cover"
				label="公开封面"
				:rules="[
					{
						required: true,
						message: '公开封面是必填项'
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
					directory-path="partyaffairs/public"
					accept="image/*"
					@change="handleUploadImage"
				></Upload>
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
				label="公开简介"
				:rules="[
					{
						required: true,
						message: '公开简介是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入公开简介" />
			</a-form-item>

			<a-form-item field="isTop" label="是否置顶" required>
				<a-switch v-model="form.isTop" type="round">
					<template #checked>是</template>
					<template #unchecked>否</template>
				</a-switch>
			</a-form-item>

			<a-form-item
				field="content"
				label="公开内容"
				:rules="[
					{
						required: true,
						message: '公开内容是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<Tinymce v-model="form.content" allow-clear placeholder="请输入公开内容" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch, getCurrentInstance } from 'vue';
import { CreatePublic, UpdatePublic } from '@/api/partyaffairs/public/api';
import { CreatePublicRequest, UpdatePublicRequest, Public, PublicClassify } from '@/api/partyaffairs/public/type';
import { FileItem, Message } from '@arco-design/web-vue';

const { proxy } = getCurrentInstance() as any;
const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Public;
	classifies: PublicClassify[];
}>();
type Type = CreatePublicRequest | UpdatePublicRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

const files = () => {
	if (props.data.cover) {
		return [
			{
				url: proxy.$rurl(props.data.cover, 300, 140)
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
	form.value.cover = file.response.key;
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
		await CreatePublic(data as CreatePublicRequest);
		Message.success('创建成功');
	} else {
		const data = { id: props.data.id };
		Object.keys(form.value).forEach((key) => {
			if (form.value[key] === props.data[key]) {
				return;
			}
			data[key] = form.value[key];
		});

		await UpdatePublic(data as UpdatePublicRequest);
		Message.success('更新成功');
	}
	emit('refresh');

	return true;
};
</script>
