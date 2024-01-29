<template>
	<a-drawer v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="name"
				label="字段名称"
				:rules="[
					{
						required: true,
						message: '字段名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" placeholder="请输入字段名称" allow-clear />
			</a-form-item>

			<a-form-item
				field="keyword"
				label="字段标识"
				:rules="[
					{
						required: true,
						message: '字段标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" placeholder="请输入字段标识" allow-clear />
			</a-form-item>

			<a-form-item
				field="type"
				label="字段类型"
				:rules="[
					{
						required: true,
						message: '字段类型是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.type"
					placeholder="请选择字段类型"
					:scrollbar="true"
					:options="types"
					allow-search
					:field-names="{ value: 'type', label: 'name' }"
				></a-select>
			</a-form-item>

			<a-form-item
				field="description"
				label="字段描述"
				:rules="[
					{
						required: true,
						message: '字段描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" placeholder="请输入字段描述" allow-clear />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ExtraField, ExtraFieldType } from '@/api/user-center/types/extra-field';
import { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
import { ref, watch } from 'vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: ExtraField;
	channels: SelectOptionData[];
	types: ExtraFieldType[];
}>();

const form = ref({ ...props.data });
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
