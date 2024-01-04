<template>
	<div class="configure">
		<div class="header">
			<div class="header-item">
				<a-button
					v-permission="'configure:template:preview'"
					type="primary"
					status="success"
					:disabled="!props.template"
					@click="(previewVisible = true), (previewForm.env_keyword = undefined)"
				>
					<template #icon><icon-brush /></template>
					生成预览
				</a-button>
			</div>

			<div class="header-item">
				<a-button
					v-permission="'configure:template:add'"
					type="primary"
					:disabled="!props.template"
					@click="(submitVisible = true), (submitForm.description = '')"
				>
					<template #icon><icon-to-top /></template>
					提交模板
				</a-button>
			</div>

			<div class="header-item">
				<a-button
					v-permission="'configure:configure:sync'"
					type="primary"
					:disabled="!props.template"
					@click="(syncVisible = true), (syncForm.env_keyword = undefined)"
				>
					<template #icon><icon-sync /></template>
					同步配置
				</a-button>
			</div>
		</div>
		<div class="edit">
			<CodeEditor
				ref="coder"
				:value="template?.content"
				:lang="submitForm.format"
				:show-line="false"
				:switch-lang="true"
				:style="{
					width: '100%',
					height: '100%'
				}"
				theme="BlackTheme"
				@change="
					(val) => {
						submitForm.content = val;
					}
				"
				@change-lang="
					(val) => {
						submitForm.format = val;
					}
				"
			></CodeEditor>
		</div>
		<a-modal v-model:visible="submitVisible" simple title="配置模板提交" @cancel="submitVisible = false" @before-ok="submitTemplate">
			<a-form ref="submitFormRef" :model="submitForm" layout="vertical">
				<a-form-item
					field="description"
					label="请简要概述一下本次提交的修改"
					:rules="[
						{
							required: true,
							message: '模板描述是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-input v-model="submitForm.description" placeholder="请输入" />
				</a-form-item>
			</a-form>
		</a-modal>

		<a-modal v-model:visible="previewVisible" simple title="渲染预览" @cancel="previewVisible = false" @before-ok="previewTemplate">
			<a-form ref="previewFormRef" :model="previewForm" layout="vertical">
				<a-form-item
					field="env_keyword"
					label="请选择需要渲染的环境"
					:rules="[
						{
							required: true,
							message: '请选择需要渲染的环境'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-select v-model="previewForm.env_keyword" allow-search placeholder="请选择">
						<template v-for="(item, index) in envs" :key="index">
							<a-option v-permission="'configure:template:preview:' + item.keyword" :value="item.keyword">{{ item.name }}</a-option>
						</template>
					</a-select>
				</a-form-item>
			</a-form>
		</a-modal>

		<a-modal v-model:visible="syncVisible" simple title="同步配置" @cancel="syncVisible = false" @before-ok="syncConfigure">
			<a-form ref="syncFormRef" :model="syncForm" layout="vertical">
				<a-form-item
					field="env_keyword"
					label="请选择需要同步的环境"
					:rules="[
						{
							required: true,
							message: '请选择需要同步的环境'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-select v-model="syncForm.env_keyword" allow-search placeholder="请选择">
						<template v-for="(item, index) in envs" :key="index">
							<a-option v-permission="'configure:configure:sync:' + item.keyword" :value="item.keyword">{{ item.name }}</a-option>
						</template>
					</a-select>
				</a-form-item>
			</a-form>
		</a-modal>

		<a-modal
			v-model:visible="contentVisible"
			title="配置详情"
			width="700px"
			:body-style="{ height: '400px', padding: '0' }"
			@cancel="contentVisible = false"
			@before-ok="contentVisible = false"
		>
			<CodeEditor
				:value="content"
				:lang="submitForm.format"
				:show-line="false"
				:read-only="true"
				:style="{
					width: '100%',
					height: '100%'
				}"
				theme="BlackTheme"
			></CodeEditor>
		</a-modal>
	</div>
</template>

<script setup lang="ts">
import { parseTemplateTest } from '@/api/configure/template';
import { Env } from '@/api/configure/types/env';
import { Template } from '@/api/configure/types/template';
import CodeEditor from '@/components/code-editor/index.vue';
import { watch, ref } from 'vue';

const props = defineProps<{
	template?: Template;
	envs?: Env[];
}>();

const emit = defineEmits(['submit', 'sync']);
const coder = ref();
const submitVisible = ref(false);
const previewVisible = ref(false);

const previewFormRef = ref();
const submitFormRef = ref();
const syncFormRef = ref();

const previewForm = ref<{ env_keyword?: string }>({});
const syncForm = ref<{ env_keyword?: string }>({});
const submitForm = ref({
	description: '',
	content: '',
	format: 'json'
});

const contentVisible = ref(false);
const content = ref('');

const syncVisible = ref(false);

const submitTemplate = async () => {
	const isError = await submitFormRef.value.validate();
	if (isError) {
		return false;
	}

	if (submitForm.value.format === 'json') {
		submitForm.value.content = JSON.stringify(JSON.parse(submitForm.value.content));
	} else {
		content.value = submitForm.value.content;
	}
	emit('submit', submitForm.value);
	return true;
};

const previewTemplate = async () => {
	const { data } = await parseTemplateTest({
		env_keyword: previewForm.value.env_keyword as string,
		content: submitForm.value.content,
		format: submitForm.value.format,
		server_id: props.template?.server_id as number
	});
	if (submitForm.value.format === 'json') {
		content.value = JSON.stringify(JSON.parse(data.content), null, 3);
	} else {
		content.value = data.content;
	}
	contentVisible.value = true;
};

const syncConfigure = () => {
	emit('sync', {
		server_id: props.template?.server_id,
		env_keyword: syncForm.value.env_keyword,
		description: '修改配置'
	});
	return true;
};

watch(
	() => props.template,
	(val) => {
		if (!val) return;
		submitForm.value.content = val.content;
		submitForm.value.format = val.format;
		coder.value.setEditLang(val.format);
	},
	{ deep: true }
);
</script>

<style lang="less" scoped>
.configure {
	.header {
		display: flex;
		margin-bottom: 15px;

		.header-item {
			display: flex;
			align-items: center;
			margin-right: 18px;
			white-space: nowrap;

			.label {
				margin-right: 8px;
				color: #666;
				font-weight: 700;
				font-size: 13px;
				white-space: nowrap;
			}
		}
	}

	.empty {
		position: absolute;
		top: 150px;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 300px;
	}

	.edit {
		display: flex;
		align-items: center;
		justify-content: center;
		height: calc(100% - 48px);
		overflow: hidden;
		border-radius: 1px;
		//   box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
	}
}
</style>
