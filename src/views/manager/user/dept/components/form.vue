<template>
	<Popup v-model:visible="visible" unmount-on-close title="绑定部门" width="280px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="right" layout="horizontal" auto-label-width>
			<a-form-item
				field="deptId"
				label="所属部门"
				:rules="[
					{
						required: true,
						message: '部门是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-tree-select
					v-model="form.deptId"
					placeholder="请选择部门"
					:scrollbar="true"
					:fieldNames="{
						key: 'id',
						title: 'name'
					}"
					:data="depts"
				/>
			</a-form-item>

			<a-form-item
				field="jobId"
				label="担任职位"
				:rules="[
					{
						required: true,
						message: '担任职位是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.jobId"
					placeholder="请选择担任职位"
					:scrollbar="true"
					:options="jobs"
					@searchApp="searchJob.Search"
					@dropdown-reach-bottom="searchJob.NextSearch"
				/>
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { Result, Search } from '@/utils/search';
import { Message } from '@arco-design/web-vue';
import { ref } from 'vue';
import { ListCurrentDept } from '@/api/manager/dept/api';
import { CreateUserDeptRequest, Dept } from '@/api/manager/user/type';
import { CreateUserDept } from '@/api/manager/user/api';
import { ListJob } from '@/api/manager/job/api';

const props = defineProps<{ userId: number }>();
const emit = defineEmits(['refresh']);

const formRef = ref();
const visible = ref(false);
const jobs = ref<Result[]>([]);
const form = ref<CreateUserDeptRequest>({} as CreateUserDeptRequest);

const searchJob = new Search(
	jobs.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListJob({ ...req, name: req.query as string | undefined });

		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return form.value.jobId === val;
	}
);

const depts = ref<Dept[]>([]);

const getDepts = () => {
	ListCurrentDept().then((res) => {
		depts.value = res.data.list;
	});
};
getDepts();

const showAddDrawer = async (userId: number) => {
	await searchJob.Search();

	visible.value = true;
	form.value = { userId } as CreateUserDeptRequest;
};

const closeDrawer = () => {
	visible.value = false;
};

defineExpose({ showAddDrawer, closeDrawer });

const handleSubmit = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}
	const data = { ...form.value, userId: props.userId };

	try {
		await CreateUserDept(data);
		Message.success('创建成功');
		emit('refresh');
		return true;
	} catch (e) {
		return false;
	}
};
</script>

<style lang="less" scoped>
.tree-content {
	width: 100%;
	max-height: 300px;
	padding: 12px;
	overflow: scroll;
	border: 1px solid var(--color-border);
	border-radius: 4px;

	&::-webkit-scrollbar {
		display: none;
	}
}

.empty {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;

	.empty-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: var(--color-neutral-5);
	}
}
</style>
