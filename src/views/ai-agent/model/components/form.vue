<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" unmount-on-close @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="vertical" auto-label-width>
			<a-form-item
				field="type"
				label="模型类型"
				:rules="[
					{
						required: true,
						message: '模型类型是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select v-model="form.type" :options="GTypes.modelTypes" allow-clear placeholder="请选择模型类型"></a-select>
			</a-form-item>

			<a-form-item
				field="title"
				label="模型标题"
				:rules="[
					{
						required: true,
						message: '模型标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" allow-clear placeholder="请输入模型标题" />
			</a-form-item>

			<a-form-item
				field="keyword"
				label="模型标识"
				:rules="[
					{
						required: true,
						message: '模型标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" allow-clear placeholder="请输入模型标识" />
			</a-form-item>

			<a-form-item
				field="supportJson"
				label="json回复"
				:rules="[
					{
						required: true,
						message: '是否支持json回复是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select v-model="form.supportJson" allow-clear placeholder="是否支持json回复">
					<a-option label="支持" :value="true"></a-option>
					<a-option label="不支持" :value="false"></a-option>
				</a-select>
			</a-form-item>

			<a-form-item
				field="supportTool"
				label="工具能力"
				:rules="[
					{
						required: true,
						message: '是否支持工具能力是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select v-model="form.supportTool" allow-clear placeholder="是否支持工具能力">
					<a-option label="支持" :value="true"></a-option>
					<a-option label="不支持" :value="false"></a-option>
				</a-select>
			</a-form-item>

			<a-form-item
				field="secretGroupId"
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
					v-model="form.secretGroupId"
					placeholder="请选择密钥分组"
					:scrollbar="true"
					:options="groups"
					@search="searchFactory.Search"
					@dropdown-reach-bottom="searchFactory.NextSearch"
				/>
			</a-form-item>

			<a-form-item
				field="description"
				label="模型描述"
				:rules="[
					{
						required: true,
						message: '模型描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入模型描述" />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CreateModelRequest, UpdateModelRequest } from '@/api/ai-agent/model/type';
import { Result, Search } from '@/utils/search';
import { CreateModel, UpdateModel } from '@/api/ai-agent/model/api';
import { Message } from '@arco-design/web-vue';
import { ListSecretGroup } from '@/api/ai-agent/secret/api';
import GTypes from './types';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

type Type = CreateModelRequest | UpdateModelRequest;
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
		return form.value.secretGroupId === val;
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
		await CreateModel(data as CreateModelRequest);
		Message.success('创建成功');
	} else {
		await UpdateModel(data as UpdateModelRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
