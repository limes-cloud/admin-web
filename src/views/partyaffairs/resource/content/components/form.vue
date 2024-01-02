<template>
	<a-drawer
		v-model:visible="visible"
		:title="isAdd ? '新建' : '修改'"
		width="380px"
		unmount-on-close
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="classify_id"
				label="所属板块"
				:rules="[{ required: true, message: '所属板块是必填项' }]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.classify_id"
					placeholder="请选择资料分类"
					:scrollbar="true"
					:options="classifys"
					:field-names="{ value: 'id', label: 'name' }"
				/>
			</a-form-item>

			<a-form-item field="title" label="资料标题" :rules="[{ required: true, message: '资料标题是必填项' }]" :validate-trigger="['change', 'input']">
				<a-input v-model="form.title" allow-clear placeholder="请输入资料标题" />
			</a-form-item>

			<a-form-item field="url" label="资料文件" :rules="[{ required: true, message: '资料文件是必填项' }]" :validate-trigger="['change', 'input']">
				<Upload
					ref="upload"
					width="100%"
					height="100px"
					text="点击或拖拽上传"
					:limit="1"
					:draggable="true"
					:multiple="false"
					:auto-upload="true"
					:files="files()"
					directory-path="resource"
					app="partyaffairs"
					list-type="text"
					accept="*"
					@change="handleUploadImage"
				/>
			</a-form-item>

			<a-form-item
				field="desc"
				label="资料简述"
				:rules="[
					{
						required: true,
						message: '资料简述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.desc" allow-clear placeholder="请输入资料简述" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ComponentInternalInstance, getCurrentInstance, ref, watch } from 'vue';
import { Resource } from '@/api/partyaffairs/types/resource';
import { FileItem } from '@arco-design/web-vue';
import { ResourceClassify } from '@/api/partyaffairs/types/resource_classify';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Resource;
	classifys: ResourceClassify[];
}>();

const form = ref({} as Resource);
const emit = defineEmits(['add', 'update']);

watch(
	() => props.data,
	(val) => {
		form.value = val;
	}
);

const files = () => {
	return form.value.resource
		? [
				{
					url: proxy?.$rurl(form.value.resource.src, 100, 100),
					sha: form.value.resource.sha,
					name: form.value.resource.name
				}
		  ]
		: [];
};

const handleUploadImage = (fs: FileItem[]) => {
	if (!fs || !fs.length) {
		form.value.url = '';
	} else {
		const file = fs[0];
		form.value.url = file.response.sha;
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
