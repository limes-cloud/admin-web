<template>
	<Popup
		v-model:visible="visible"
		title="资源值配置"
		width="380px"
		:footer="$hasPermission('configure:resource:value:update')"
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
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
						v-model="form[String(item.id)]"
						:style="{ width: '100%', height: '150px' }"
						:show-folding="false"
						:show-line="false"
						:show-fullscreen="true"
					></CodeEditor>
				</a-form-item>
			</template>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ResourceValue, Value } from '@/api/configure/resource/type';
import { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
import { ref } from 'vue';
import CodeEditor from '@/components/code-editor/index.vue';
import { ListResourceValue, UpdateResourceValue } from '@/api/configure/resource/api';
import { Message } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);
const resourceId = ref(0);
const props = defineProps<{
	envs: SelectOptionData[];
}>();

const values = ref<ResourceValue[]>([]);
const form = ref<Record<string, any>>({});

const showUpdateDrawer = async (id: number) => {
	resourceId.value = id;
	form.value = {};
	const { data } = await ListResourceValue({ resourceId: id });
	values.value = data.list;
	data.list.forEach((item) => {
		form.value[String(item.envId)] = item.value;
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

	await UpdateResourceValue({ resourceId: resourceId.value, list });
	Message.success('设置成功');
	return true;
};
</script>
