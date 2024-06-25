<template>
	<a-drawer v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="name"
				label="服务名称"
				:rules="[
					{
						required: true,
						message: '服务名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" placeholder="请输入服务名称" allow-clear />
			</a-form-item>

			<a-form-item
				field="keyword"
				label="服务标志"
				:rules="[
					{
						required: true,
						message: '服务标志是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" placeholder="请输入服务标志" allow-clear />
			</a-form-item>

			<a-form-item
				field="description"
				label="服务描述"
				:rules="[
					{
						required: true,
						message: '服务描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" placeholder="请输入服务描述" allow-clear />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { CreateServerRequest, Server, UpdateServerRequest } from '@/api/configure/server/type';
import { CreateServer, UpdateServer } from '@/api/configure/server/api';
import { Message } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Server;
}>();

const form = ref({ ...props.data });
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
		await CreateServer(data as CreateServerRequest);
		Message.success('创建成功');
	} else {
		await UpdateServer(data as UpdateServerRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
