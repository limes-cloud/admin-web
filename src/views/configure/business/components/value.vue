<template>
	<Popup
		v-model:visible="visible"
		title="资源值配置"
		width="380px"
		:footer="$hasPermission('configure:business:value:update')"
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
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
						<CodeEditor
							v-model="form[String(item.id)]"
							:style="{ width: '100%', height: '150px' }"
							:show-folding="false"
							:show-line="false"
							:show-fullscreen="true"
						></CodeEditor>
					</template>
				</a-form-item>
			</template>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { BusinessValue, Value } from '@/api/configure/business/type';
import { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
import { ref } from 'vue';
import CodeEditor from '@/components/code-editor/index.vue';
import { ListBusinessValue, UpdateBusinessValue } from '@/api/configure/business/api';
import { Message } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);
const businessId = ref(0);
const props = defineProps<{
	type: string;

	envs: SelectOptionData[];
}>();

const values = ref<BusinessValue[]>([]);
const form = ref<Record<string, any>>({});

const showUpdateDrawer = async (id: number) => {
	businessId.value = id;
	form.value = {};
	const { data } = await ListBusinessValue({ businessId: id });
	values.value = data.list;
	data.list.forEach((item) => {
		let res: any = item.value;
		if (props.type === 'int' || props.type === 'float') {
			res = JSON.parse(item.value);
		}

		if (props.type === 'bool') {
			res = item.value === 'true';
		}

		form.value[String(item.envId)] = res;
	});
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

	const list: Value[] = [];
	// 组装数据
	props.envs.forEach((item) => {
		const value = form.value[String(item.id)];
		list.push({
			envId: item.id,
			value: String(value)
		});
	});

	await UpdateBusinessValue({ businessId: businessId.value, list });
	Message.success('设置成功');
	return true;
};
</script>
