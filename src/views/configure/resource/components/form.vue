<template>
	<a-drawer v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="keyword"
				label="变量标识"
				:rules="[
					{
						required: true,
						message: '变量标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" :disabled="!isAdd" placeholder="请输入变量标识" allow-clear />
			</a-form-item>

			<a-form-item
				field="tag"
				label="变量标签"
				:rules="[
					{
						required: true,
						message: '变量标签是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.tag" placeholder="请输入变量标签" allow-clear />
			</a-form-item>

			<a-form-item
				field="fieldList"
				label="变量字段"
				:rules="[
					{
						required: true,
						message: '变量字段是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-tag v-model="form.fieldList" placeholder="请输入变量字段" unique-value allow-clear />
			</a-form-item>

			<a-form-item
				field="private"
				label="变量类型"
				:rules="[
					{
						required: true,
						message: '变量类型是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-radio-group v-model="form.private">
					<a-radio :value="true">私有变量</a-radio>
					<a-radio :value="false">公共变量</a-radio>
				</a-radio-group>
			</a-form-item>

			<a-form-item
				v-if="form.private"
				field="serverIds"
				label="所属服务"
				:rules="[
					{
						required: true,
						message: '所属服务是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.serverIds"
					placeholder="请选择变量所属服务"
					multiple
					:max-tag-count="2"
					:scrollbar="true"
					:options="servers"
					allow-search
					@search="searchFieldFactory.Search"
					@dropdown-reach-bottom="searchFieldFactory.NextSearch"
				></a-select>
			</a-form-item>

			<a-form-item
				field="description"
				label="变量描述"
				:rules="[
					{
						required: true,
						message: '变量描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" placeholder="请输入变量描述" allow-clear />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CreateResourceRequest, UpdateResourceRequest } from '@/api/configure/resource/type';
import { CreateResource, GetResource, UpdateResource } from '@/api/configure/resource/api';
import { Message } from '@arco-design/web-vue';
import { Result, Search } from '@/utils/search';
import { ListServer } from '@/api/configure/server/api';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

type Type = (CreateResourceRequest | UpdateResourceRequest) & { fieldList: string[] };
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

const servers = ref<Result[]>([]);

const searchFieldFactory = new Search(
	servers.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListServer({ ...req, status: true, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return !!form.value.serverIds?.includes(val as number);
	}
);
searchFieldFactory.Search();

const showAddDrawer = () => {
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = async (id: number) => {
	form.value = {} as Type;
	const { data } = await GetResource({ id });
	const serverIds: number[] = [];
	if (data.private) {
		data.servers.forEach((item) => {
			servers.value.push({ label: item.name, value: item.id });
			serverIds.push(item.id);
		});
	}
	form.value = { ...data, fieldList: data.fields.split(','), serverIds };
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
	data.fields = data.fieldList.join(',');
	if (isAdd.value) {
		await CreateResource({ ...data } as CreateResourceRequest);
		Message.success('创建成功');
	} else {
		await UpdateResource(data as UpdateResourceRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
