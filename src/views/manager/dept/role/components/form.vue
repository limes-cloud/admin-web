<template>
	<Popup v-model:visible="visible" unmount-on-close title="绑定角色" width="280px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="right" layout="horizontal" auto-label-width>
			<a-form-item
				field="roleIds"
				label="角色"
				:rules="[
					{
						required: true,
						message: '角色是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.roleIds"
					placeholder="请选择角色"
					:scrollbar="true"
					:options="roles"
					multiple
					@search="search.Search"
					@dropdown-reach-bottom="search.NextSearch"
				/>
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { Result, Search } from '@/utils/search';
import { Message } from '@arco-design/web-vue';
import { ref } from 'vue';
import { ListCurrentRole } from '@/api/manager/role/api';
import { CreateDeptRolesRequest } from '@/api/manager/dept/type';
import { CreateDeptRoles } from '@/api/manager/dept/api';

const props = defineProps<{ deptId: number }>();

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const form = ref<CreateDeptRolesRequest>({} as CreateDeptRolesRequest);
const emit = defineEmits(['refresh']);

const roles = ref<Result[]>([]);

const search = new Search(
	roles.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListCurrentRole({ ...req, name: req.query as string | undefined });

		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return form.value.roleIds.includes(val);
	}
);

const showAddDrawer = (deptId: number) => {
	search.Search();

	visible.value = true;
	form.value = { deptId, roleIds: [] };
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
	const data = { ...form.value, deptId: props.deptId };

	try {
		await CreateDeptRoles(data);
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
	overflow: scroll;
	border: 1px solid var(--color-border);
	padding: 12px;
	border-radius: 4px;
	&::-webkit-scrollbar {
		display: none;
	}
}

.empty {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	.empty-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: var(--color-neutral-5);
	}
}
</style>
