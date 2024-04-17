<template>
	<a-drawer
		v-model:visible="visible"
		:title="isAdd ? '新建' : '修改'"
		width="380px"
		unmount-on-close
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="left" layout="vertical" auto-label-width>
			<a-row :gutter="8">
				<a-col :span="12">
					<a-form-item
						field="name"
						label="任务名称"
						:rules="[
							{
								required: true,
								message: '任务名称是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-input v-model="form.name" allow-clear placeholder="请输入任务名称" />
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						field="group_id"
						label="任务分组"
						:rules="[
							{
								required: true,
								message: '任务名称是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-select
							v-model="form.group_id"
							placeholder="请选择任务分组"
							:scrollbar="true"
							:options="groups"
							:field-names="{ value: 'id', label: 'name' }"
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="8">
				<a-col :span="12">
					<a-form-item
						field="select_type"
						label="节点类型"
						:rules="[
							{
								required: true,
								message: '节点类型是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-select
							v-model="form.select_type"
							placeholder="请选择节点类型"
							:scrollbar="true"
							:options="[
								{ label: '节点', value: 'worker' },
								{ label: '分组', value: 'group' }
							]"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						v-if="form.select_type === 'group'"
						field="worker_group_id"
						label="执行分组"
						:rules="[
							{
								required: true,
								message: '执行分组是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-select
							v-model="form.worker_group_id"
							placeholder="请选择执行分组"
							allow-clear
							:scrollbar="true"
							:options="groups"
							:field-names="{ value: 'id', label: 'name' }"
						/>
					</a-form-item>
					<a-form-item
						v-if="form.select_type === 'worker'"
						field="worker_id"
						label="执行节点"
						:rules="[
							{
								required: true,
								message: '执行节点是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-select
							v-model="form.worker_id"
							placeholder="请选择执行节点"
							:scrollbar="true"
							allow-search
							allow-clear
							:options="optionWorkers"
							:field-names="{ value: 'id', label: 'name' }"
							@search="handleSearch"
							@focus="handleSearch()"
							@dropdown-reach-bottom="handleSearchNext"
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="8">
				<a-col :span="12">
					<a-form-item
						field="tag"
						label="任务标签"
						:rules="[
							{
								required: true,
								message: '任务名称是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-input v-model="form.tag" allow-clear placeholder="请输入任务标签" />
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						field="exec_type"
						label="执行类型"
						:rules="[
							{
								required: true,
								message: '表达式是必填项'
							}
						]"
					>
						<a-select
							v-model="form.exec_type"
							placeholder="请选择执行类型"
							:scrollbar="true"
							:options="[
								{ label: 'Shell', value: 'shell' },
								{ label: 'Http', value: 'http' }
							]"
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-form-item
				field="spec"
				label="表达式"
				:rules="[
					{
						required: true,
						message: '表达式是必填项'
					},
					{
						validator: validateCron
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.spec" allow-clear placeholder="请输入表达式" />
				<template v-if="nexts.length == 2" #extra>
					<a-space>
						<span>下次执行:{{ nexts[0] }}</span>
						<span>再次执行:{{ nexts[1] }}</span>
					</a-space>
				</template>
			</a-form-item>

			<a-form-item
				field="exec_value"
				label="执行内容"
				:rules="[
					{
						required: true,
						message: '执行内容是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.exec_value" style="height: 100px" placeholder="请输入执行内容" />
			</a-form-item>

			<a-row :gutter="8">
				<a-col :span="12">
					<a-form-item
						field="expect_code"
						label="成功状态"
						:rules="[
							{
								required: true,
								message: '任务内容是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-input-number v-model="form.expect_code" placeholder="成功状态"></a-input-number>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						field="retry_count"
						label="重试次数"
						:rules="[
							{
								required: true,
								message: '任务内容是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-input-number v-model="form.retry_count" placeholder="0则不重试"></a-input-number>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="8">
				<a-col :span="12">
					<a-form-item
						field="retry_wait_time"
						label="等待时长"
						:rules="[
							{
								required: true,
								message: '等待时长是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-input-number v-model="form.retry_wait_time" placeholder="非0则重试等待/秒"></a-input-number>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						field="max_exec_time"
						label="执行时长"
						:rules="[
							{
								required: true,
								message: '执行时长是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-input-number v-model="form.max_exec_time" placeholder="非0则超时结束任务"></a-input-number>
					</a-form-item>
				</a-col>
			</a-row>

			<a-form-item
				field="description"
				label="任务描述"
				:rules="[
					{
						required: true,
						message: '任务描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入任务描述" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Task, TaskGroup } from '@/api/cron/types/task';
import { PageWorkerReq, Worker } from '@/api/cron/types/worker';
import { pageWorker } from '@/api/cron/worker';
import cronParser from 'cron-parser';

const nexts = ref<string[]>([]);
const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const innerWorkerIds = ref<number[]>([]);
const innerWorkers = ref<Worker[]>([]);
const optionWorkers = ref<Worker[]>([]);
const searchTotal = ref(0);
const searchParams = ref<PageWorkerReq>({
	page: 1,
	page_size: 10,
	status: true
});

const props = defineProps<{
	data: Task;
	groups: TaskGroup[];
}>();

const form = ref({} as Task);
const emit = defineEmits(['add', 'update']);

watch(
	() => props.data,
	(val) => {
		form.value = val;
		innerWorkers.value = [];
		if (form.value.worker) {
			innerWorkers.value.push(form.value.worker as unknown as Worker);
			innerWorkerIds.value.push(form.value.worker_id);
		}
	}
);

const validateCron = (value, cb) => {
	nexts.value = [];

	const len = value.split(' ').length;
	if (len !== 6 && len !== 7) {
		cb('表达式错误');
		return;
	}
	try {
		const interval = cronParser.parseExpression(value);
		const first = interval.next().toDate().toLocaleString();
		const scond = interval.next().toDate().toLocaleString();
		nexts.value = nexts.value.concat([first, scond]);
	} catch (error) {
		cb('表达式错误');
	}
};

const showAddDrawer = () => {
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = async () => {
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

	if (isAdd.value) {
		emit('add', { ...form.value });
	} else {
		emit('update', { ...form.value });
	}
	return true;
};

const handleSearch = async (val?: string) => {
	optionWorkers.value = [...innerWorkers.value];
	searchParams.value = { page: 1, page_size: 10, status: true, name: val };
	const { data } = await pageWorker(searchParams.value);
	data.list.forEach((item) => {
		if (!innerWorkerIds.value.includes(item.id)) {
			optionWorkers.value.push(item);
		}
	});
	searchTotal.value = data.total;
};

const handleSearchNext = async () => {
	if (searchTotal.value < searchParams.value.page_size * searchParams.value.page) {
		return;
	}
	searchParams.value.page += 1;
	const { data } = await pageWorker(searchParams.value);
	data.list.forEach((item) => {
		if (!innerWorkerIds.value.includes(item.id)) {
			optionWorkers.value.push(item);
		}
	});
};
</script>
