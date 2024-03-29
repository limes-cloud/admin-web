<template>
	<a-drawer
		v-model:visible="visible"
		:title="isAdd ? '新建' : '修改'"
		width="580px"
		unmount-on-close
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="classify_id"
				label="所属板块"
				:rules="[
					{
						required: true,
						message: '新闻标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.classify_id"
					placeholder="请选择新闻分类"
					:scrollbar="true"
					:options="classifys"
					:field-names="{ value: 'id', label: 'name' }"
				/>
			</a-form-item>

			<a-form-item field="is_top" label="是否置顶" required>
				<a-switch v-model="form.is_top" type="round">
					<template #checked>是</template>
					<template #unchecked>否</template>
				</a-switch>
			</a-form-item>

			<a-form-item
				field="title"
				label="新闻标题"
				:rules="[
					{
						required: true,
						message: '新闻标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" allow-clear placeholder="请输入新闻标题" />
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
				field="cover"
				label="新闻封面"
				:rules="[
					{
						required: true,
						message: '新闻封面是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<Upload
					ref="upload"
					width="300px"
					height="180px"
					:multiple="true"
					:auto-upload="true"
					:limit="1"
					:files="files()"
					directory-path="news/cover"
					app="PartyAffairs"
					list-type="picture-card"
					accept="image/*"
					@change="handleUploadImage"
				></Upload>
			</a-form-item>

			<a-form-item
				field="desc"
				label="新闻简述"
				:rules="[
					{
						required: true,
						message: '新闻简述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.desc" allow-clear placeholder="请输入新闻简述" />
			</a-form-item>

			<a-form-item
				field="content"
				label="新闻正文"
				:rules="[
					{
						required: true,
						message: '新闻正文是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<Tinymce v-model="form.content" allow-clear placeholder="请输入通知标题" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { NewsContent, NewsClassify } from '@/api/party-affairs/types/news';
import { FileItem } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const props = defineProps<{
	data: NewsContent;
	classifys: NewsClassify[];
}>();

const form = ref({} as NewsContent);
const emit = defineEmits(['add', 'update']);
const files = () => {
	return form.value.resource
		? [
				{
					url: proxy?.$rurl(form.value.resource.src, 300, 180),
					sha: form.value.resource.sha,
					name: form.value.resource.name
				}
		  ]
		: [];
};

watch(
	() => props.data,
	(val) => {
		form.value = val;
	}
);

const handleUploadImage = (fs: FileItem[]) => {
	if (!fs || fs.length === 0) {
		form.value.cover = '';
	} else {
		const file = fs[0];
		form.value.cover = file.response.sha;
	}
};

const showAddDrawer = () => {
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = async () => {
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
