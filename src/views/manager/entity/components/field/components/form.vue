<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="320px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="name"
				label="字段标识"
				:rules="[
					{
						required: true,
						message: '字段标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入字段标识" />
			</a-form-item>

			<a-form-item
				field="comment"
				label="字段备注"
				:rules="[
					{
						required: true,
						message: '字段备注是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.comment" allow-clear placeholder="请输入字段备注" />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { CreateEntityField, UpdateEntityField } from '@/api/manager/entity/api';
import { ref, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { EntityField, UpdateEntityFieldRequest } from '@/api/manager/entity/type';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const dvs = ref<UpdateEntityFieldRequest[]>();

const props = defineProps<{
	data: UpdateEntityFieldRequest;
	entityId: number;
	values?: EntityField[];
}>();

const form = ref({} as UpdateEntityFieldRequest);
const emit = defineEmits(['refresh']);

watch(
	() => props.data,
	(val) => {
		if (!val) return;
		form.value = { ...val };
	}
);

watch(
	() => props.values,
	(val) => {
		if (!val) return;
		const temp = { id: 0, label: '顶级节点', children: [] } as any as EntityField;
		temp.children = props.values;
		dvs.value = [temp];
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
	const data = { ...form.value, entityId: props.entityId };
	try {
		if (isAdd.value) {
			await CreateEntityField(data);
			Message.success('创建成功');
		} else {
			await UpdateEntityField(data);
			Message.success('更新成功');
		}
	} catch (e) {
		return true;
	}
	emit('refresh');
	return true;
};
</script>
