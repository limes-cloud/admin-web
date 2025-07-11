<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="name"
				label="分组名称"
				:rules="[
					{
						required: true,
						message: '分组名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入分组名称" />
			</a-form-item>

			<a-form-item
				field="host"
				label="基础地址"
				:rules="[
					{
						required: true,
						message: '基础地址是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.host" allow-clear placeholder="请输入基础地址" />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { CreateSecretGroupRequest, UpdateSecretGroupRequest, SecretGroup } from '@/api/ai-agent/secret/type';
import { CreateSecretGroup, UpdateSecretGroup } from '@/api/ai-agent/secret/api';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: SecretGroup;
}>();

type Type = CreateSecretGroupRequest | UpdateSecretGroupRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

watch(
	() => props.data,
	(val) => {
		form.value = { ...val };
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
		await CreateSecretGroup(data as CreateSecretGroupRequest);
		Message.success('创建成功');
	} else {
		await UpdateSecretGroup(data as UpdateSecretGroupRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
