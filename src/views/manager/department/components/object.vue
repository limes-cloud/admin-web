<template>
	<a-drawer v-model:visible="visible" title="部门资源" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="object_id"
				label="资源对象"
				:rules="[
					{
						required: true,
						message: '资源对象是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.object_id"
					placeholder="请选择资源对象"
					:scrollbar="true"
					:options="objects"
					allow-search
					:field-names="{ value: 'id', label: 'name' }"
					@focus="search('')"
					@search="search"
					@change="handleSelectObject"
				></a-select>
			</a-form-item>

			<a-form-item
				field="values"
				label="资源项"
				:rules="[
					{
						required: true,
						message: '资源项是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.values"
					:max-tag-count="4"
					multiple
					placeholder="请选择资源项"
					allow-search
					:scrollbar="true"
					:options="objectValues"
				></a-select>
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { allDepartmentObject, importDepartmentObject } from '@/api/manager/department';
import { Message } from '@arco-design/web-vue';
import { pageObject, loadObjectValue } from '@/api/manager/object';
import { AddDepartmentObjectReq } from '@/api/manager/types/department';
import { ObjectDef } from '@/api/manager/types/object';

const formRef = ref();
const visible = ref(false);
const form = ref({} as AddDepartmentObjectReq);
const objects = ref<ObjectDef[]>([]);
const objectValues = ref<string[]>([]);

const search = async (val: string) => {
	const { data } = await pageObject({ page: 1, page_size: 10, keyword: val });
	const list: ObjectDef[] = [];
	data.list.forEach((item) => {
		list.push({
			...item,
			name: `${item.name}(${item.keyword})`
		});
	});
	objects.value = list;
};

const show = (id: number) => {
	form.value = {} as AddDepartmentObjectReq;
	visible.value = true;
	form.value.department_id = id;
};

const close = () => {
	visible.value = false;
};

defineExpose({ show, close });

const handleSubmit = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}
	await importDepartmentObject(form.value);
	Message.success('设置成功');
	return true;
};

const handleSelectObject = async () => {
	const { data } = await allDepartmentObject({ object_id: form.value.object_id, department_id: form.value.department_id });
	form.value.values = data.values;

	let obj: ObjectDef = {} as ObjectDef;
	objects.value.forEach((item) => {
		if (item.id === form.value.object_id) {
			obj = item;
		}
	});
	const list: any[] = (await loadObjectValue(obj)) as any[];
	list.forEach((item, index) => {
		list[index].value = String(item.value);
	});
	objectValues.value = list;
};
</script>
