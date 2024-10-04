<template>
	<a-drawer v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="name"
				label="分类名称"
				:rules="[
					{
						required: true,
						message: '分类名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入分类名称" />
			</a-form-item>
			<a-form-item
				field="weight"
				label="轮播权重"
				:rules="[
					{
						required: true,
						message: '轮播权重是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-number v-model="form.weight" placeholder="请输入轮播权重" mode="button" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { CreateResourceClassifyRequest, UpdateResourceClassifyRequest, ResourceClassify } from '@/api/partyaffairs/resource/type';
import { CreateResourceClassify, UpdateResourceClassify } from '@/api/partyaffairs/resource/api';
import { Message } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: ResourceClassify;
}>();

type Type = CreateResourceClassifyRequest | UpdateResourceClassifyRequest;
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
		await CreateResourceClassify(data as CreateResourceClassifyRequest);
		Message.success('创建成功');
	} else {
		await UpdateResourceClassify(data as UpdateResourceClassifyRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
