<template>
	<a-drawer v-model:visible="visible" title="资源值配置" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form v-if="type" ref="formRef" :model="form" label-align="left" layout="vertical" auto-label-width>
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
					<template v-if="type === 'int'">
						<a-input-number v-model="form[String(item.id)]" placeholder="请输入变量值" mode="button" :precision="0" />
					</template>

					<template v-if="type === 'float'">
						<a-input-number v-model="form[String(item.id)]" placeholder="请输入变量值" mode="button" />
					</template>

					<template v-if="type === 'string'">
						<a-input v-model="form[String(item.id)]" placeholder="请输入变量值" allow-clear />
					</template>

					<template v-if="type === 'textarea'">
						<a-textarea v-model="form[String(item.id)]" placeholder="请输入变量值" allow-clear />
					</template>

					<template v-if="type === 'bool'">
						<a-switch v-model="form[String(item.id)]" type="round">
							<template #checked>是</template>
							<template #unchecked>否</template>
						</a-switch>
					</template>

					<template v-if="type === 'object'">
						<CodeEditor v-model="form[String(item.id)]" :style="{ width: '100%', height: '150px' }" :show-folding="false" :show-line="false"></CodeEditor>
					</template>
				</a-form-item>
			</template>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { BusinessValue } from '@/api/configure/types/business-value';
import { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
import { ref, watch } from 'vue';
import CodeEditor from '@/components/code-editor/index.vue';

const formRef = ref();
const visible = ref(false);

const props = defineProps<{
	type: string;
	values: BusinessValue[];
	envs: SelectOptionData[];
}>();

const form = ref<Record<string, any>>({});
const emit = defineEmits(['update']);

watch(
	() => props.values,
	(val) => {
		form.value = {};
		val.forEach((item) => {
			let res: any = item.value;
			if (props.type === 'int' || props.type === 'float') {
				res = JSON.parse(item.value);
			}

			if (props.type === 'bool') {
				res = item.value === 'true';
			}

			form.value[String(item.environment_id)] = res;
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

	const list: BusinessValue[] = [];
	// 组装数据
	props.envs.forEach((item) => {
		const value = form.value[String(item.id)];
		list.push({
			env_keyword: item.keyword,
			environment_id: item.id,
			value: String(value)
		});

		// try {
		//   const value = JSON.stringify(JSON.parse(form.value[String(item.id)]));
		//   list.push({
		//     env_keyword: item.keyword,
		//     environment_id: item.id,
		//     value,
		//   });
		// } catch (error) {
		//   console.log(error);
		// }
	});
	emit('update', [...list]);
	return true;
};
</script>
