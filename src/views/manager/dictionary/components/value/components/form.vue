<template>
	<a-drawer v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="label"
				label="标签"
				:rules="[
					{
						required: true,
						message: '标签是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.label" allow-clear placeholder="请输入标识" />
			</a-form-item>

			<a-form-item
				field="value"
				label="标识"
				:rules="[
					{
						required: true,
						message: '标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.value" allow-clear placeholder="请输入标识" />
			</a-form-item>

			<a-form-item
				field="status"
				label="状态"
				:rules="[
					{
						required: true,
						message: '状态是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-radio-group v-model="form.status" :default-value="true">
					<a-radio :value="true">启用</a-radio>
					<a-radio :value="false">禁用</a-radio>
				</a-radio-group>
			</a-form-item>

			<a-form-item
				field="weight"
				label="权重"
				:rules="[
					{
						required: true,
						message: '权重是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-number v-model="form.weight" placeholder="请输入权重" :default-value="0" mode="button" />
			</a-form-item>

			<a-form-item field="type" label="类型">
				<a-input v-model="form.type" allow-clear placeholder="请输入类型" />
			</a-form-item>

			<a-form-item field="extra" label="扩展信息">
				<a-input v-model="form.extra" allow-clear placeholder="请输入扩展信息" />
			</a-form-item>

			<a-form-item field="description" label="字典值描述">
				<a-textarea v-model="form.description" allow-clear placeholder="请输入字典值描述" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { DictionaryValue } from '@/api/manager/types/dictionary';
import { ref, watch } from 'vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: DictionaryValue;
}>();

const form = ref({ weight: 0, status: true } as DictionaryValue);
const emit = defineEmits(['add', 'update']);

watch(
	() => props.data,
	(val) => {
		form.value = val;
	}
);

const showAddDrawer = () => {
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = () => {
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
