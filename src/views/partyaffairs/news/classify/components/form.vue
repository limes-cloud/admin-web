<template>
	<a-drawer v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="name"
				label="板块名称"
				:rules="[
					{
						required: true,
						message: '板块名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入板块名称" />
			</a-form-item>

			<a-form-item
				field="weight"
				label="板块权重"
				:rules="[
					{
						required: true,
						message: '板块权重是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-number v-model="form.weight" placeholder="请输入板块权重" :default-value="0" mode="button" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { NewsClassify } from '@/api/partyaffairs/types/news_classify';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: NewsClassify;
}>();

const form = ref({
	name: '',
	weight: 0
});
const emit = defineEmits(['add', 'update']);

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

	if (isAdd.value) {
		emit('add', { ...form.value });
	} else {
		emit('update', { ...form.value });
	}
	return true;
};
</script>
