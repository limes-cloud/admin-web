<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="480px" unmount-on-close @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" auto-label-width>
			<a-form-item
				field="icon"
				label="工具图标"
				:rules="[
					{
						required: true,
						message: '工具图标是必填项'
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
					directory-path="ai-agent/tool"
					accept="image/*"
					@change="handleUploadImage"
				></Upload>
			</a-form-item>

			<a-form-item
				field="keyword"
				label="工具标识"
				:rules="[
					{
						required: true,
						message: '工具标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" allow-clear placeholder="请输入工具标识" />
			</a-form-item>

			<a-form-item
				field="title"
				label="工具标题"
				:rules="[
					{
						required: true,
						message: '工具标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" allow-clear placeholder="请输入工具标题" />
			</a-form-item>

			<a-form-item
				field="description"
				label="工具描述"
				:rules="[
					{
						required: true,
						message: '工具描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入工具描述，用于模型识别" />
			</a-form-item>

			<a-form-item
				field="type"
				label="工具类型"
				:rules="[
					{
						required: true,
						message: '工具类型是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select v-model="form.type" :options="GTypes.toolTypes" allow-clear placeholder="请选择工具类型"></a-select>
			</a-form-item>

			<a-form-item
				v-if="form.type !== 'local'"
				field="content"
				label="工具内容"
				:rules="[
					{
						required: true,
						message: '工具内容是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<CodeEditor
					v-model="form.content"
					:lang="getCodeLang()"
					:style="{ width: '100%', height: '150px' }"
					:show-folding="false"
					:show-line="false"
					:show-fullscreen="true"
				></CodeEditor>
			</a-form-item>

			<a-form-item
				field="introduce"
				label="工具介绍"
				:rules="[
					{
						required: true,
						message: '工具描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.introduce" allow-clear placeholder="请输入工具介绍" />
			</a-form-item>

			<a-form-item
				field="schema"
				label="工具参数"
				:rules="[
					{
						required: true,
						message: '工具参数是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<CodeEditor
					v-model="form.schema"
					lang="json"
					:style="{ width: '100%', height: '150px' }"
					:show-folding="false"
					:show-line="false"
					:show-fullscreen="true"
				></CodeEditor>
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance } from 'vue';
import { CreateToolRequest, Tool, UpdateToolRequest } from '@/api/ai-agent/tool/type';
import { CreateTool, UpdateTool } from '@/api/ai-agent/tool/api';
import { FileItem, Message } from '@arco-design/web-vue';
import GTypes from './types';

const { proxy } = getCurrentInstance() as any;

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

type Type = CreateToolRequest | UpdateToolRequest | Tool;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

const getCodeLang = () => {
	switch (form.value.type) {
		case 'http':
			return 'json';
		case 'js':
			return 'javascript';
		default:
			return 'json';
	}
};

const showAddDrawer = () => {
	form.value = {} as Type;
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = async (data) => {
	form.value = { ...data };
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

	const data = { ...form.value };
	if (isAdd.value) {
		await CreateTool(data as CreateToolRequest);
		Message.success('创建成功');
	} else {
		await UpdateTool(data as UpdateToolRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};

const files = () => {
	const data = form.value as Tool;
	if (data.iconUrl) {
		return [
			{
				url: proxy.$rurl(data.iconUrl, 100, 100),
				sha: data.icon
			}
		];
	}
	return [];
};

const handleUploadImage = (fs: FileItem[]) => {
	if (!fs || !fs.length) return;
	const file = fs[0];
	form.value.icon = file.response.sha;
};
</script>
