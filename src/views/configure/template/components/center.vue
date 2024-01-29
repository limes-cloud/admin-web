<template>
	<div class="configure">
		<div class="header">
			<div class="header-item">
				<a-button v-permission="'configure:template:preview'" type="primary" status="success" :disabled="!props.template" @click="handleClickPreview">
					<template #icon><icon-brush /></template>
					生成预览
				</a-button>
			</div>

			<div class="header-item">
				<a-button v-permission="'configure:template:add'" type="primary" :disabled="!props.template" @click="handleCompareTemplate">
					<template #icon><icon-to-top /></template>
					提交模板
				</a-button>
			</div>

			<div class="header-item">
				<a-button v-permission="'configure:configure:sync'" type="primary" :disabled="!props.template" @click="handleClickSync">
					<template #icon><icon-sync /></template>
					同步配置
				</a-button>
			</div>

			<!-- <div class="header-item">
				<a-button v-permission="'configure:configure:sync'" type="primary" status="warning" :disabled="!props.template" @click="handleClickSyncLog">
					<template #icon><icon-menu /></template>
					同步日志
				</a-button>
			</div> -->
		</div>
		<div class="edit">
			<CodeEditor
				ref="coder"
				v-model="submitTemplateForm.content"
				:lang="submitTemplateForm.format"
				:show-line="false"
				:switch-lang="true"
				:style="{
					width: '100%',
					height: '100%'
				}"
				@change-lang="
					(val:string) => {
						submitTemplateForm.format = val;
					}
				"
			></CodeEditor>
		</div>

		<a-modal v-model:visible="envVisible" simple title="请选择环境" @cancel="envVisible = false" @before-ok="handleChooseEnv">
			<a-form ref="envFormRef" :model="envForm" layout="vertical">
				<a-form-item
					field="env_id"
					:label="'请选择需要' + envForm.title + '的环境'"
					:rules="[
						{
							required: true,
							message: '请选择需要渲染的环境'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-select v-model="envForm.env_id" allow-search placeholder="请选择">
						<template v-for="(item, index) in envs" :key="index">
							<a-option :value="item.id">{{ item.name }}</a-option>
						</template>
					</a-select>
				</a-form-item>
			</a-form>
		</a-modal>

		<a-modal
			v-model:visible="contentVisible"
			title="配置详情"
			width="900px"
			unmount-on-close
			:body-style="{ height: '500px', padding: '0' }"
			@cancel="contentVisible = false"
			@before-ok="contentVisible = false"
		>
			<CodeEditor
				:value="content"
				:lang="submitTemplateForm.format"
				:show-line="false"
				:read-only="true"
				:style="{
					width: '100%',
					height: '100%'
				}"
			></CodeEditor>
		</a-modal>

		<a-modal
			v-model:visible="compareVisible"
			title="变更详情"
			width="900px"
			ok-text="确认变更"
			unmount-on-close
			:body-style="{ height: '500px', padding: '0' }"
			@cancel="compareVisible = false"
			@before-ok="handleSureCompare"
		>
			<Compare :data="compareData"></Compare>
		</a-modal>

		<a-modal v-model:visible="descVisible" simple title="变更描述" @cancel="descVisible = false" @before-ok="handleSubmit">
			<a-form ref="descFormRef" :model="descForm" layout="vertical">
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
					<a-input v-model="descForm.description" placeholder="请输入" />
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script setup lang="ts">
import { parseTemplate, compareTemplate } from '@/api/configure/template';
import { Env } from '@/api/configure/types/env';
import { CompareTemplateInfo, Template } from '@/api/configure/types/template';
import { watch, ref, reactive } from 'vue';
import { Message } from '@arco-design/web-vue';
import { compareConfigure } from '@/api/configure/configure';
import Compare from './compare.vue';

const props = defineProps<{
	template?: Template;
	envs?: Env[];
}>();

const SUBMIT_TEMPLATE = 'submit';
const SYNC_CONFIGURE = 'sync';
const PREVIEW_CONFIGURE = 'preview';

const emit = defineEmits(['submit', 'sync']);
const coder = ref();

const compareVisible = ref(false);
const operator = ref('');

const envVisible = ref(false);
const envFormRef = ref();
const envForm = ref<{ env_id?: number; title?: string }>({});

const descVisible = ref(false);
const descFormRef = ref();
const descForm = ref<{ description?: string }>({});

const submitTemplateForm = reactive({
	description: '',
	content: '',
	format: 'json'
});

const contentVisible = ref(false);
const content = ref('');

const compareData = ref<CompareTemplateInfo[]>([]);

const submitTemplate = async () => {
	submitTemplateForm.description = descForm.value.description as string;
	if (submitTemplateForm.format === 'json') {
		submitTemplateForm.content = JSON.stringify(JSON.parse(submitTemplateForm.content));
	} else {
		content.value = submitTemplateForm.content;
	}
	emit('submit', submitTemplateForm);
	return true;
};

const syncConfigure = () => {
	emit('sync', {
		server_id: props.template?.server_id,
		env_id: envForm.value.env_id,
		description: descForm.value.description
	});
	return true;
};

const handleCompareTemplate = async () => {
	const { data } = await compareTemplate({
		id: props.template?.id as number,
		content: submitTemplateForm.content,
		format: submitTemplateForm.format
	});
	if (!data.list.length) {
		Message.error('模板不存在变更');
		return;
	}
	operator.value = SUBMIT_TEMPLATE;
	compareVisible.value = true;
	compareData.value = data.list;
};

const handleCompareConfigure = async () => {
	const { data } = await compareConfigure({
		server_id: props.template?.server_id as number,
		env_id: envForm.value.env_id as number
	});
	if (!data.list.length) {
		Message.error('配置不存在变更');
		return;
	}
	compareVisible.value = true;
	compareData.value = data.list;
};

const handleSureCompare = () => {
	compareVisible.value = false;
	descForm.value.description = '';
	descVisible.value = true;
	return true;
};

const handleSubmit = async () => {
	if (operator.value === SUBMIT_TEMPLATE) {
		submitTemplate();
	}
	if (operator.value === SYNC_CONFIGURE) {
		syncConfigure();
	}
};

const handleClickPreview = () => {
	envVisible.value = true;
	envForm.value.env_id = undefined;
	envForm.value.title = '预览';
	operator.value = PREVIEW_CONFIGURE;
};

const handleClickSync = () => {
	envVisible.value = true;
	envForm.value.env_id = undefined;
	envForm.value.title = '同步';
	operator.value = SYNC_CONFIGURE;
};

const handlePreviewTemplate = async () => {
	const { data } = await parseTemplate({
		content: submitTemplateForm.content,
		format: submitTemplateForm.format,
		env_id: envForm.value.env_id as number,
		server_id: props.template?.server_id as number
	});
	if (submitTemplateForm.format === 'json') {
		content.value = JSON.stringify(JSON.parse(data.content), null, 3);
	} else {
		content.value = data.content;
	}
	contentVisible.value = true;
};

const handleChooseEnv = async () => {
	const isError = await envFormRef.value.validate();
	if (isError) {
		return false;
	}

	if (operator.value === PREVIEW_CONFIGURE) {
		handlePreviewTemplate();
	}

	if (operator.value === SYNC_CONFIGURE) {
		handleCompareConfigure();
	}
	return true;
};

watch(
	() => props.template,
	(val) => {
		if (!val) return;
		submitTemplateForm.content = val.content;
		submitTemplateForm.format = val.format;
		coder.value.setEditLang(val.format);
	},
	{ deep: true }
);
</script>

<style lang="less" scoped>
.compare {
	height: 100%;
	overflow: hidden;
	border-radius: 4px;
}

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
				color: var(--color-text-2);
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
