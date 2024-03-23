<template>
	<a-drawer v-model:visible="visible" title="变量值配置" width="380px" unmount-on-close @cancel="visible = false" @before-ok="handleSubmit">
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
					<CodeEditor v-model="form[item.id]" :style="{ width: '100%', height: '150px' }" :show-folding="false" :show-line="false"></CodeEditor>
				</a-form-item>
			</template>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ResourceValue } from '@/api/configure/types/resource';
import { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
import { ref, watch } from 'vue';
import CodeEditor from '@/components/code-editor/index.vue';
import { Message } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);

const props = defineProps<{
	values: ResourceValue[];
	envs: SelectOptionData[];
}>();

const form = ref<Record<string, string>>({});

const emit = defineEmits(['update']);

watch(
	() => props.values,
	(val) => {
		if (!val) return;
		form.value = {};
		val.forEach((item) => {
			form.value[item.env_id] = item.value;
		});
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
				env_id: item.id,
				value: JSON.stringify(JSON.parse(content))
			});
		});
	} catch (error) {
		Message.error('数据格式存在错误');
		return false;
	}
	emit('update', [...list]);
	return true;
};
</script>
