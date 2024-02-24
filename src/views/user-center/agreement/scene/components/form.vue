<template>
	<a-drawer
		v-model:visible="visible"
		unmount-on-close
		:title="isAdd ? '新建' : '修改'"
		width="380px"
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="name"
				label="场景名称"
				:rules="[
					{
						required: true,
						message: '场景名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" placeholder="请输入场景名称" allow-clear />
			</a-form-item>

			<a-form-item
				field="keyword"
				label="场景标识"
				:rules="[
					{
						required: true,
						message: '场景标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" placeholder="请输入场景标识" allow-clear />
			</a-form-item>

			<a-form-item field="agreement_ids" label="场景协议">
				<a-select
					v-model="form.content_ids"
					placeholder="请选择场景协议"
					multiple
					:max-tag-count="2"
					:scrollbar="true"
					:options="contents"
					allow-search
					:field-names="{ value: 'id', label: 'name' }"
				></a-select>
			</a-form-item>

			<a-form-item
				field="description"
				label="场景描述"
				:rules="[
					{
						required: true,
						message: '场景描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" placeholder="请输入场景描述" allow-clear />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { Scene } from '@/api/user-center/types/agreement';
import { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
import { ref, watch } from 'vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Scene;
	contents: SelectOptionData[];
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
