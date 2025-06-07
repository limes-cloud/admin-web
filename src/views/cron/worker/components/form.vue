<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" unmount-on-close @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="name"
				label="节点名称"
				:rules="[
					{
						required: true,
						message: '节点名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入节点名称" />
			</a-form-item>

			<a-form-item
				field="ip"
				label="节点ip"
				:rules="[
					{
						required: true,
						message: '节点ip是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.ip" :disabled="data.status" allow-clear placeholder="请输入节点ip" />
			</a-form-item>

			<a-form-item
				field="ak"
				label="节点ak"
				:rules="[
					{
						required: true,
						message: '节点ak是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.ak" :disabled="data.status" allow-clear placeholder="请输入节点ak" />
			</a-form-item>

			<a-form-item
				field="sk"
				label="节点sk"
				:rules="[
					{
						required: true,
						message: '节点sk是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.sk" :disabled="data.status" allow-clear placeholder="请输入节点sk" />
			</a-form-item>

			<a-form-item field="groupId" label="节点分组">
				<a-select
					v-model="form.groupId"
					placeholder="请选择节点分组"
					:scrollbar="true"
					:options="groups"
					@search="searchFactory.Search"
					@dropdown-reach-bottom="searchFactory.NextSearch"
				/>
			</a-form-item>

			<a-form-item
				field="description"
				label="节点描述"
				:rules="[
					{
						required: true,
						message: '节点描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入节点描述" />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { CreateWorkerRequest, UpdateWorkerRequest, Worker } from '@/api/cron/worker/type';
import { CreateWorker, ListWorkerGroup, UpdateWorker } from '@/api/cron/worker/api';
import { Result, Search } from '@/utils/search';
import { Message } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const props = defineProps<{
	data: Worker;
}>();

type Type = CreateWorkerRequest | UpdateWorkerRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);
const groups = ref<Result[]>([]);

const searchFactory = new Search(
	groups.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListWorkerGroup({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.groupId === val;
	}
);

watch(
	() => props.data,
	(val) => {
		form.value = { ...val };
		if (val.groupId) {
			if (!searchFactory.IsExist(val.groupId)) {
				groups.value.push({ label: val.group?.name, value: val.groupId } as Result);
			}
		}
	}
);

const showAddDrawer = () => {
	searchFactory.Search();
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = async () => {
	searchFactory.Search();
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
		await CreateWorker(data as CreateWorkerRequest);
		Message.success('创建成功');
	} else {
		await UpdateWorker(data as UpdateWorkerRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
