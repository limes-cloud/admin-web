<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" unmount-on-close @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="vertical" auto-label-width>
			<a-form-item
				field="groupId"
				label="密钥分组"
				:rules="[
					{
						required: true,
						message: '密钥分组是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.groupId"
					placeholder="请选择密钥分组"
					:scrollbar="true"
					:options="groups"
					@search="searchFactory.Search"
					@dropdown-reach-bottom="searchFactory.NextSearch"
				/>
			</a-form-item>

			<a-form-item
				field="token"
				label="密钥token"
				:rules="[
					{
						required: true,
						message: '密钥token是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.token" allow-clear placeholder="请输入密钥token" />
			</a-form-item>

			<a-form-item
				field="description"
				label="密钥描述"
				:rules="[
					{
						required: true,
						message: '密钥描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入密钥描述" />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CreateSecretRequest, UpdateSecretRequest } from '@/api/ai-agent/secret/type';
import { Result, Search } from '@/utils/search';
import { CreateSecret, ListSecretGroup, UpdateSecret } from '@/api/ai-agent/secret/api';
import { Message } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

type Type = CreateSecretRequest | UpdateSecretRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

const groups = ref<Result[]>([]);

const searchFactory = new Search(
	groups.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListSecretGroup({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.groupId === val;
	}
);

const showAddDrawer = () => {
	searchFactory.Search();

	form.value = {} as Type;
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = async (data) => {
	if (!searchFactory.IsExist(data.groupId)) {
		groups.value.push({ label: data.group?.name, value: data.groupId } as Result);
	}

	searchFactory.Search();

	form.value = { ...data };

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
	if (isAdd.value) {
		await CreateSecret(data as CreateSecretRequest);
		Message.success('创建成功');
	} else {
		await UpdateSecret(data as UpdateSecretRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
