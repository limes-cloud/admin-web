<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="database"
				label="数据库"
				:rules="[
					{
						required: true,
						message: '数据库是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.database" allow-clear placeholder="请输入数据库" />
			</a-form-item>

			<a-form-item
				field="name"
				label="实体名称"
				:rules="[
					{
						required: true,
						message: '实体名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入实体名称" />
			</a-form-item>

			<a-form-item
				field="comment"
				label="实体描述"
				:rules="[
					{
						required: true,
						message: '实体描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.comment" allow-clear placeholder="请输入实体描述" />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { CreateEntity, UpdateEntity } from '@/api/manager/entity/api';
import { Message } from '@arco-design/web-vue';
import { Entity } from '@/api/manager/entity/type';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Entity;
}>();

const form = ref({} as Entity);
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
		await CreateEntity(data);
		Message.success('创建成功');
	} else {
		await UpdateEntity(data);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
