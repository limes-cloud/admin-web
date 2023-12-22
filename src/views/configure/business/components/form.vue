<template>
	<a-drawer v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="keyword"
				label="变量标志"
				:rules="[
					{
						required: true,
						message: '变量标志是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" placeholder="请输入变量标志" allow-clear />
			</a-form-item>

			<a-form-item
				field="type"
				label="变量类型"
				:rules="[
					{
						required: true,
						message: '变量类型是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select v-model="form.type" placeholder="请选择变量类型" :scrollbar="true">
					<template v-for="(item, index) in variableTypes" :key="index">
						<a-option :value="index">{{ item }}</a-option>
					</template>
				</a-select>
			</a-form-item>

			<a-form-item
				field="description"
				label="变量描述"
				:rules="[
					{
						required: true,
						message: '变量描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" placeholder="请输入变量描述" allow-clear />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { Business } from '@/api/configure/types/business';
import { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
import { ref, watch } from 'vue';
import variableTypes from './type';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Business;
	servers?: SelectOptionData[];
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
