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
						field="groupId"
						label="任务分组"
						:rules="[
							{
								required: true,
								message: '任务分组是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-select
							v-model="form.groupId"
							placeholder="请选择任务分组"
							:scrollbar="true"
							:options="groups"
							@search="searchFactory.Search"
							@dropdown-reach-bottom="searchFactory.NextSearch"
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="8">
				<a-col :span="12">
					<a-form-item
						field="workerType"
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
							v-model="form.workerType"
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
						v-if="form.workerType === 'group'"
						field="workerGroupId"
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
							v-model="form.workerGroupId"
							placeholder="请选择执行分组"
							allow-clear
							:scrollbar="true"
							:options="workerGroups"
							@search="searchWorkerGroupFactory.Search"
							@dropdown-reach-bottom="searchWorkerGroupFactory.NextSearch"
						/>
					</a-form-item>
					<a-form-item
						v-if="form.workerType === 'worker'"
						field="workerId"
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
							v-model="form.workerId"
							placeholder="请选择执行节点"
							:scrollbar="true"
							allow-search
							allow-clear
							:options="workers"
							@search="searchWorkerFactory.Search"
							@dropdown-reach-bottom="searchWorkerFactory.NextSearch"
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
						field="execType"
						label="执行类型"
						:rules="[
							{
								required: true,
								message: '表达式是必填项'
							}
						]"
					>
						<a-select
							v-model="form.execType"
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
				field="execValue"
				label="执行内容"
				:rules="[
					{
						required: true,
						message: '执行内容是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<CodeEditor
					v-model="form.execValue"
					:lang="getCodeLang()"
					:style="{ width: '100%', height: '150px' }"
					:show-folding="false"
					:show-line="false"
					:show-fullscreen="true"
				></CodeEditor>
			</a-form-item>

			<a-row :gutter="8">
				<a-col :span="12">
					<a-form-item
						field="expectCode"
						label="成功状态"
						:rules="[
							{
								required: true,
								message: '任务内容是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-input-number v-model="form.expectCode" placeholder="成功状态"></a-input-number>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						field="retryCount"
						label="重试次数"
						tooltip="任务失败重试次数，0则不重试"
						:rules="[
							{
								required: true,
								message: '重试次数是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-input-number v-model="form.retryCount" placeholder="请输入重试次数"></a-input-number>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="8">
				<a-col :span="12">
					<a-form-item
						field="retryWaitTime"
						label="等待时长"
						tooltip="任务重试时等待时长，0则不等待，单位/秒"
						:rules="[
							{
								required: true,
								message: '等待时长是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-input-number v-model="form.retryWaitTime" placeholder="请输入等待时长"></a-input-number>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						field="maxExecTime"
						label="执行时长"
						tooltip="任务执行最长时长，超过则中断，0则不限制，单位/秒"
						:rules="[
							{
								required: true,
								message: '执行时长是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-input-number v-model="form.maxExecTime" placeholder="请输入执行市场"></a-input-number>
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
import { ref } from 'vue';
import cronParser from 'cron-parser';
import { CreateTaskRequest, UpdateTaskRequest } from '@/api/cron/task/type';
import { Result, Search } from '@/utils/search';
import { ListWorker, ListWorkerGroup } from '@/api/cron/worker/api';
import { CreateTask, GetTask, ListTaskGroup, UpdateTask } from '@/api/cron/task/api';
import { Message } from '@arco-design/web-vue';

const nexts = ref<string[]>([]);
const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

type Type = CreateTaskRequest | UpdateTaskRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

const workerGroups = ref<Result[]>([]);
const workers = ref<Result[]>([]);
const groups = ref<Result[]>([]);

const getCodeLang = () => {
	switch (form.value.execType) {
		case 'http':
			return 'json';
		case 'shell':
			return 'shell';
		default:
			return 'json';
	}
};

const searchWorkerGroupFactory = new Search(
	workerGroups.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListWorkerGroup({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.workerGroupId === val;
	}
);

const searchWorkerFactory = new Search(
	workers.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListWorker({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.workerId === val;
	}
);

const searchFactory = new Search(
	groups.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListTaskGroup({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.groupId === val;
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
	searchFactory.Search();
	searchWorkerFactory.Search();
	searchWorkerGroupFactory.Search();

	form.value = {} as Type;
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = async (id: number) => {
	const { data } = await GetTask({ id });
	if (!searchFactory.IsExist(data.groupId)) {
		groups.value.push({ label: data.group?.name, value: data.groupId } as Result);
	}
	if (data.workerId && !searchWorkerFactory.IsExist(data.workerId)) {
		groups.value.push({ label: data.worker?.name, value: data.workerId } as Result);
	}
	if (data.workerGroupId && !searchWorkerGroupFactory.IsExist(data.workerGroupId)) {
		groups.value.push({ label: data.workerGroup?.name, value: data.workerGroupId } as Result);
	}

	searchFactory.Search();
	searchWorkerFactory.Search();
	searchWorkerGroupFactory.Search();

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

	const data = form.value;
	if (isAdd.value) {
		await CreateTask(data as CreateTaskRequest);
		Message.success('创建成功');
	} else {
		await UpdateTask(data as UpdateTaskRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
