<template>
	<Popup v-model:visible="visible" title="模拟运行" width="480px" unmount-on-close :footer="false" @cancel="visible = false">
		<a-form ref="formRef" :model="form" label-align="left" auto-label-width>
			<a-form-item
				field="input"
				label="输入参数"
				:rules="[
					{
						required: true,
						message: '输入参数是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<CodeEditor
					v-model="form.input"
					lang="json"
					:style="{ width: '100%', height: '150px' }"
					:show-folding="false"
					:show-line="false"
					:show-fullscreen="true"
					:read-only="form.lock"
				></CodeEditor>
			</a-form-item>
			<a-form-item>
				<a-button type="primary" @click="handleSubmit">确定</a-button>
			</a-form-item>
		</a-form>
		<a-divider orientation="left">执行结果</a-divider>
		<a-textarea v-model="result" allow-clear readonly placeholder="执行返回结果" />
	</Popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ExecToolRequest, Tool } from '@/api/ai-agent/tool/type';
import { ExecTool } from '@/api/ai-agent/tool/api';
import { Message } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);
const result = ref('');

type Type = ExecToolRequest & { lock: boolean };
const form = ref<Type>({} as Type);

const showAddDrawer = (t: Tool) => {
	form.value = { id: t.id } as Type;
	if (t.type === 'api') {
		form.value.lock = true;
		form.value.input = t.content as string;
	}
	visible.value = true;
};

const closeDrawer = () => {
	visible.value = false;
};

defineExpose({ showAddDrawer, closeDrawer });

const handleSubmit = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}

	const { data } = await ExecTool({ ...form.value });
	Message.success('执行成功');
	result.value = data.output;
	return true;
};
</script>
