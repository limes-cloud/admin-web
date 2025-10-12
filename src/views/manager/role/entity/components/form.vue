<template>
	<Popup v-model:visible="visible" unmount-on-close :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="right" layout="horizontal" auto-label-width>
			<a-form-item
				field="appId"
				label="所属应用"
				:rules="[
					{
						required: true,
						message: '所属应用是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.appId"
					placeholder="请选择所属应用"
					:scrollbar="true"
					:options="apps"
					:disabled="!isAdd"
					@change="handlerSelectApp"
					@searchApp="searchApp.Search"
					@dropdown-reach-bottom="searchApp.NextSearch"
				/>
			</a-form-item>

			<a-form-item
				field="entityId"
				label="所属实体"
				:rules="[
					{
						required: true,
						message: '所属实体是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.entityId"
					placeholder="请选择所属实体"
					:scrollbar="true"
					:options="entities"
					:disabled="!isAdd"
					@change="handlerSelectEntity"
					@searchApp="searchEntity.Search"
					@dropdown-reach-bottom="searchEntity.NextSearch"
				/>
			</a-form-item>

			<a-form-item
				field="action"
				label="操作类型"
				:rules="[
					{
						required: true,
						message: '操作类型是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select v-model="form.action" placeholder="请选择操作类型" :scrollbar="true" :options="actions" :disabled="!isAdd" />
			</a-form-item>

			<a-form-item
				field="scope"
				label="权限范围"
				:rules="[
					{
						required: true,
						message: '权限范围是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select v-model="form.scope" placeholder="请选择权限范围" :scrollbar="true" :options="scopes" />
			</a-form-item>

			<!-- tooltip="不选择则表示拥有该操作的所有字段权限" -->
			<a-form-item field="fieldArray" label="字段权限">
				<a-select v-model="form.fieldArray" placeholder="请选择字段权限" :scrollbar="true" :options="fields" multiple />
			</a-form-item>

			<a-form-item field="ruleArray" label="过滤规则">
				<a-select v-model="form.ruleArray" placeholder="请选择过滤规则" :scrollbar="true" :options="rules" multiple />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ListCurrentApp } from '@/api/manager/app/api';
import { ListEntity, ListEntityField, ListEntityRule } from '@/api/manager/entity/api';
import { CreateRoleEntity, UpdateRoleEntity } from '@/api/manager/role/api';
import { RoleEntity, CreateRoleEntityRequest, UpdateRoleEntityRequest } from '@/api/manager/role/type';
import { Result, Search } from '@/utils/search';
import { Message } from '@arco-design/web-vue';
import { ref } from 'vue';
import { scopes, actions } from './global';

const props = defineProps<{ roleId: number }>();

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

type Type = (CreateRoleEntityRequest | UpdateRoleEntityRequest) & { fieldArray: string[]; ruleArray: string[] };
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

const rules = ref<Result[]>([]);
const fields = ref<Result[]>([]);

const apps = ref<Result[]>([]);
const entities = ref<Result[]>([]);

const searchApp = new Search(
	apps.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListCurrentApp({ ...req, name: req.query as string | undefined });

		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return form.value.appId === val;
	}
);

const searchEntity = new Search(
	entities.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListEntity({ ...req, appId: form.value.appId, name: req.query as string | undefined });

		data.list.forEach((item) => {
			res.push({ label: `${item.name}(${item.comment})`, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return form.value.entityId === val;
	}
);

const handlerSelectApp = () => {
	form.value.entityId = undefined;
	searchEntity.Search();
};

const fetchFields = async () => {
	const { data } = await ListEntityField({ entityId: form.value.entityId! });
	fields.value = data.list.map((item) => ({ label: `${item.name}(${item.comment})`, value: item.id }));
};

const fetchRules = async () => {
	const { data } = await ListEntityRule({ entityId: form.value.entityId! });
	rules.value = data.list.map((item) => ({ label: item.name, value: item.id }));
};

const handlerSelectEntity = async () => {
	await Promise.all([fetchFields(), fetchRules()]);
};

const showAddDrawer = () => {
	searchApp.Search();

	visible.value = true;
	isAdd.value = true;
	form.value = {} as Type;
};

const showUpdateDrawer = async (data: RoleEntity) => {
	form.value = {
		...data,
		entityId: data.entity.id,
		appId: data.entity.app?.id,
		fieldArray: [],
		ruleArray: []
	} as Type;

	await Promise.all([searchApp.Search(), searchEntity.Search(), fetchFields(), fetchRules()]);

	if (!searchApp.IsExist(data.entity.appId)) {
		apps.value.push({ label: data.entity.app?.name, value: data.entity.appId } as Result);
	}

	if (!searchEntity.IsExist(data.entity.id)) {
		entities.value.push({ label: data.entity.name, value: data.entity.id } as Result);
	}

	try {
		form.value.fieldArray = JSON.parse(data.fields);
		form.value.ruleArray = JSON.parse(data.rules);
	} catch (e) {
		form.value.fieldArray = [];
		form.value.ruleArray = [];
	}

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
	const data = { ...form.value, fields: JSON.stringify(form.value.fieldArray), rules: JSON.stringify(form.value.ruleArray) };
	data.roleId = props.roleId;

	try {
		if (isAdd.value) {
			await CreateRoleEntity(data as CreateRoleEntityRequest);
			Message.success('创建成功');
		} else {
			await UpdateRoleEntity(data as UpdateRoleEntityRequest);
			Message.success('更新成功');
		}
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
