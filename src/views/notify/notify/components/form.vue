<template>
	<a-drawer
		v-model:visible="visible"
		:title="isAdd ? '新建' : '修改'"
		width="380px"
		unmount-on-close
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="left" auto-label-width>
			<a-form-item
				field="categoryId"
				label="所属分组"
				:rules="[
					{
						required: true,
						message: '所属分组是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.categoryId"
					placeholder="请选择所属分组"
					:scrollbar="true"
					:options="groups"
					@search="searchFactory.Search"
					@dropdown-reach-bottom="searchFactory.NextSearch"
				/>
			</a-form-item>

			<a-form-item
				field="keyword"
				label="通知标识"
				:rules="[
					{
						required: true,
						message: '通知标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" allow-clear placeholder="请输入通知标识" />
			</a-form-item>

			<a-form-item
				field="name"
				label="通知名称"
				:rules="[
					{
						required: true,
						message: '通知名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入通知名称" />
			</a-form-item>

			<a-form-item
				field="title"
				label="通知标题"
				:rules="[
					{
						required: true,
						message: '通知标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" allow-clear placeholder="请输入通知标题" />
			</a-form-item>

			<a-form-item
				field="variable"
				label="通知变量"
				:rules="[
					{
						required: true,
						message: '通知变量是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-tag v-model="form.variable" allow-clear placeholder="请输入通知变量" />
			</a-form-item>

			<a-form-item
				field="priority"
				label="优先级"
				:rules="[
					{
						required: true,
						message: '优先级是必填项'
					}
				]"
			>
				<a-select
					v-model="form.priority"
					placeholder="请选择优先级"
					:scrollbar="true"
					:options="[
						{ label: 'P0', value: 0 },
						{ label: 'P1', value: 1 },
						{ label: 'P2', value: 2 },
						{ label: 'P3', value: 3 }
					]"
				/>
			</a-form-item>

			<a-form-item
				field="sendMode"
				label="发送模式"
				:rules="[
					{
						required: true,
						message: '发送模式是必填项'
					}
				]"
			>
				<a-select
					v-model="form.sendMode"
					placeholder="请选择发送模式"
					:scrollbar="true"
					:options="[
						{ label: '全部发送', value: 'all' },
						{ label: '优先发送', value: 'priority' }
					]"
				/>
			</a-form-item>

			<a-form-item
				field="isTimely"
				label="超时控制"
				:rules="[
					{
						required: true,
						message: '超时控制是必填项'
					}
				]"
			>
				<a-select
					v-model="form.isTimely"
					placeholder="请选择超时控制"
					:scrollbar="true"
					:options="[
						{ label: '开启', value: true },
						{ label: '关闭', value: false }
					]"
				/>
			</a-form-item>

			<a-form-item
				v-if="form.isTimely"
				field="expire"
				label="超时时间"
				:rules="[
					{
						required: true,
						message: '超时时间是必填项'
					},
					{
						type: 'number',
						min: 1,
						message: '超时时间必须大于0秒'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-number v-model="form.expire" allow-clear placeholder="请输入超时时间" />
			</a-form-item>

			<a-form-item
				field="cache"
				label="缓存时间"
				:rules="[
					{
						required: true,
						message: '缓存时间是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-number v-model="form.cache" allow-clear placeholder="请输入缓存时间，防止在短时间内重复发送" />
			</a-form-item>

			<a-form-item
				field="description"
				label="通知描述"
				:rules="[
					{
						required: true,
						message: '通知描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入通知描述" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CreateNotifyRequest, Notify, UpdateNotifyRequest } from '@/api/notify/notify/type';
import { Result, Search } from '@/utils/search';
import { CreateNotify, ListNotifyCategory, UpdateNotify } from '@/api/notify/notify/api';
import { Message } from '@arco-design/web-vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

type Type = CreateNotifyRequest | UpdateNotifyRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

const groups = ref<Result[]>([]);

const searchFactory = new Search(
	groups.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListNotifyCategory({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.categoryId === val;
	}
);

const showAddDrawer = () => {
	searchFactory.Search();

	form.value = {} as Type;
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = async (data: Notify) => {
	searchFactory.Search();

	form.value = { ...data };
	form.value.isTimely = form.value.expire !== 0;
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
	if (!data.isTimely) {
		data.expire = 0;
	}
	if (isAdd.value) {
		await CreateNotify(data as CreateNotifyRequest);
		Message.success('创建成功');
	} else {
		await UpdateNotify(data as UpdateNotifyRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
