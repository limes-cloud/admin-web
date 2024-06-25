<template>
	<a-drawer v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="keyword"
				label="变量标识"
				:rules="[
					{
						required: true,
						message: '变量标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" placeholder="请输入变量标识" allow-clear />
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
import { ref, watch } from 'vue';
import { Business, CreateBusinessRequest, UpdateBusinessRequest } from '@/api/configure/business/type';
import { CreateBusiness, UpdateBusiness } from '@/api/configure/business/api';
import { Message } from '@arco-design/web-vue';
import variableTypes from './type';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Business;
	serverId: number;
}>();

type Type = CreateBusinessRequest | UpdateBusinessRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

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

	const data = form.value;
	if (isAdd.value) {
		await CreateBusiness({ ...data, serverId: props.serverId } as CreateBusinessRequest);
		Message.success('创建成功');
	} else {
		await UpdateBusiness(data as UpdateBusinessRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
