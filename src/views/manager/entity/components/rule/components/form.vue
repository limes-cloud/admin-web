<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="580px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="name"
				label="规则标识"
				:rules="[
					{
						required: true,
						message: '规则标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入规则标识" />
			</a-form-item>

			<a-form-item
				field="description"
				label="规则备注"
				:rules="[
					{
						required: true,
						message: '规则备注是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.description" allow-clear placeholder="请输入规则备注" />
			</a-form-item>

			<a-form-item field="comment" label="规则配置">
				<SQL ref="sqlRef" v-model="form.expObjcet" :fields="fields"></SQL>
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { CreateEntityRule, ListEntityField, UpdateEntityRule } from '@/api/manager/entity/api';
import { ref, watch } from 'vue';
import { Message } from '@arco-design/web-vue';
import { EntityRule, UpdateEntityRuleRequest } from '@/api/manager/entity/type';
import SQL from '@/components/sql-condition-builder/index.vue';

const sqlRef = ref();
const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const dvs = ref<UpdateEntityRuleRequest[]>();

interface Field {
	keyword: string;
	name: string;
}

const fields = ref<Field[]>([]);
type Type = UpdateEntityRuleRequest & { expObjcet: any };

const props = defineProps<{
	entityId: number;
	values?: EntityRule[];
}>();

const form = ref({
	expObjcet: {
		logic: 'AND',
		conditions: [],
		groups: []
	}
} as Type);

const emit = defineEmits(['refresh']);

watch(
	() => props.values,
	(val) => {
		if (!val) return;
		dvs.value = val;
	}
);

// handleGet 处理查询
const handleGetFields = async () => {
	const { data } = await ListEntityField({ entityId: props.entityId });
	data.list.forEach((item) => {
		fields.value.push({
			keyword: item.name,
			name: item.comment as string
		});
	});
};

const init = (data?: EntityRule) => {
	if (!data) {
		form.value = {
			expObjcet: {
				logic: 'AND',
				conditions: [],
				groups: []
			}
		} as Type;
		return;
	}
	try {
		form.value.expObjcet = JSON.parse(data?.expression as string);
	} catch (e) {
		form.value.expObjcet = {
			logic: 'AND',
			conditions: [],
			groups: []
		};
	}
	form.value = { ...data, expObjcet: form.value.expObjcet } as Type;
};

const showAddDrawer = async () => {
	await handleGetFields();
	init();

	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = async (data: EntityRule) => {
	await handleGetFields();
	init(data);

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

	console.log(sqlRef.value.validate());
	if (!sqlRef.value.validate()) {
		Message.error('规则表达式不完整');
		return false;
	}

	form.value.expression = JSON.stringify(form.value.expObjcet);

	const data = { ...form.value, entityId: props.entityId };
	try {
		if (isAdd.value) {
			await CreateEntityRule(data);
			Message.success('创建成功');
		} else {
			await UpdateEntityRule(data);
			Message.success('更新成功');
		}
	} catch (e) {
		return true;
	}
	emit('refresh');
	return true;
};
</script>
