<template>
	<a-drawer v-model:visible="visible" title="变量值配置" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="vertical" auto-label-width>
			<template v-for="(item, index) in envs" :key="index">
				<a-form-item
					:field="String(item.id)"
					:label="item.name + '(' + item.keyword + ')'"
					:rules="[
						{
							required: true,
							message: item.name + '(' + item.keyword + ')' + '配置是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<CodeEditor
						:id="String(item.id)"
						:value="cloneForm[item.id]"
						:style="{ width: '100%', height: '150px' }"
						:show-folding="false"
						:show-line="false"
						@change="codeChange"
					></CodeEditor>
				</a-form-item>
			</template>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ResourceValue } from '@/api/configure/types/resource-value';
import { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
import { ref, watch } from 'vue';
import CodeEditor from '@/components/code-editor/index.vue';
import { Message } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);
// const envs = ref<SelectOptionData[]>([]);

const props = defineProps<{
	values: ResourceValue[];
	envs: SelectOptionData[];
}>();

const form = ref<Record<string, string>>({});
const cloneForm = ref<Record<string, string>>({});

const emit = defineEmits(['update']);

watch(
	() => props.values,
	(val) => {
		if (!val) return;
		form.value = {};
		val.forEach((item) => {
			form.value[item.environment_id] = item.values;
		});
		cloneForm.value = { ...form.value };
	}
);

const showUpdateDrawer = () => {
	visible.value = true;
};

const closeDrawer = () => {
	visible.value = false;
};

defineExpose({ showUpdateDrawer, closeDrawer });

const handleSubmit = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}

	const list: ResourceValue[] = [];
	// 组装数据
	try {
		props.envs.forEach((item) => {
			const content = JSON.stringify(JSON.parse(form.value[item.id]));
			list.push({
				env_keyword: item.keyword,
				environment_id: item.id,
				values: JSON.stringify(JSON.parse(content))
			});
		});
	} catch (error) {
		Message.error('数据格式存在错误');
		return false;
	}
	emit('update', [...list]);
	return true;
};

const codeChange = (val: string, id: string) => {
	form.value[id] = val;
};
</script>
