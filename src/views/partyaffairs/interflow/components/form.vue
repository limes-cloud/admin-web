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
				field="description"
				label="分类描述"
				:rules="[
					{
						required: true,
						message: '分类名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入分类描述" />
			</a-form-item>

			<a-form-item
				field="personObject"
				label="人员设置"
				:rules="[
					{
						required: true,
						message: '人员设置是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.personObject"
					placeholder="请选择人员设置"
					multiple
					:scrollbar="true"
					:options="users"
					:field-names="{ value: 'id', label: 'nickname' }"
					@search="handleSearchUser"
				/>
			</a-form-item>

			<a-form-item
				field="weight"
				label="分类权重"
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
import { CreateInterflowClassifyRequest, UpdateInterflowClassifyRequest, InterflowClassify } from '@/api/partyaffairs/interflow/type';
import { CreateInterflowClassify, UpdateInterflowClassify } from '@/api/partyaffairs/interflow/api';
import { Message } from '@arco-design/web-vue';
import { ListUser } from '@/api/manager/user/api';
import { User } from '@/api/manager/user/type';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: InterflowClassify;
}>();

const form = ref<InterflowClassify>({} as InterflowClassify);
const emit = defineEmits(['refresh']);

watch(
	() => props.data,
	(val) => {
		form.value = { ...val };
	}
);

const users = ref<User[]>([]);
const handleSearchUser = async (name?: string) => {
	const { data } = await ListUser({ page: 1, pageSize: 10, username: name });
	users.value = data.list;
};
handleSearchUser();

const showAddDrawer = () => {
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = () => {
	form.value = { ...props.data };
	users.value = users.value.concat(form.value.users as User[]);

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

	const data = { ...form.value };
	data.person = JSON.stringify(data.personObject);
	if (isAdd.value) {
		await CreateInterflowClassify(data as CreateInterflowClassifyRequest);
		Message.success('创建成功');
	} else {
		await UpdateInterflowClassify(data as UpdateInterflowClassifyRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
