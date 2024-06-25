<template>
	<div class="content">
		<a-button v-permission="'uc:userinfo:add'" style="margin-bottom: 15px" type="primary" @click="handleClickAddUserUserinfo">
			<template #icon>
				<icon-plus />
			</template>
			新增信息
		</a-button>
		<a-table
			:scroll="{
				y: '100%'
			}"
			:columns="userinfoColumns"
			:pagination="false"
			:data="userinfos"
			:bordered="false"
		>
			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updatedAt) }}
			</template>

			<template #operations="{ record }">
				<a-space class="point">
					<a-tag v-permission="'uc:userinfo:update'" color="orangered" @click="handleClickUpdate(record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<a-popconfirm content="您确认删除此信息" type="warning" @ok="deleteUserUserinfo(record.id)">
						<a-tag v-permission="'uc:userinfo:delete'" color="red" class="cursor-pointer">
							<template #icon><icon-delete /></template>
							删除
						</a-tag>
					</a-popconfirm>
				</a-space>
			</template>
		</a-table>
	</div>
	<a-pagination
		:total="userinfoTotal"
		:current="userinfoSearchParams.page"
		:page-size="userinfoSearchParams.pageSize"
		show-total
		show-jumper
		show-page-size
		@change="handleUserinfoPageChange"
		@page-size-change="handleUserinfoPageSizeChange"
	/>

	<a-modal
		v-model:visible="addUserinfoVisible"
		:title="(isAdd ? '新增' : '修改') + '信息'"
		:width="300"
		@cancel="addUserinfoVisible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="addUserinfoFormRef" :model="addUserinfoForm" label-align="left" layout="vertical" auto-label-width>
			<a-form-item
				field="keyword"
				label="信息标识"
				:rules="[
					{
						required: true,
						message: '信息标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="addUserinfoForm.keyword"
					placeholder="请选择信息标识"
					:scrollbar="true"
					:options="searchUserinfos"
					@search="searchFieldFactory.Search"
					@dropdown-reach-bottom="searchFieldFactory.NextSearch"
				></a-select>
			</a-form-item>

			<a-form-item
				field="value"
				label="信息值"
				:rules="[
					{
						required: true,
						message: '信息值是必填项'
					}
				]"
			>
				<a-input v-model="addUserinfoForm.value" allow-clear placeholder="请输入信息值" />
			</a-form-item>
		</a-form>
	</a-modal>
</template>

<script lang="ts" setup>
import { ListField } from '@/api/usercenter/field/api';
import { ListUserinfo, CreateUserinfo, DeleteUserinfo, UpdateUserinfo } from '@/api/usercenter/userinfo/api';
import { Userinfo, ListUserinfoRequest, CreateUserinfoRequest, UpdateUserinfoRequest } from '@/api/usercenter/userinfo/type';
import { TableColumn } from '@/types/global';
import { Result, Search } from '@/utils/search';
import { Message } from '@arco-design/web-vue';
import { ref } from 'vue';

const props = defineProps<{
	userId: number;
}>();

const isAdd = ref(true);
const addUserinfoFormRef = ref();
const userinfoTotal = ref(0);
const userinfoSearchParams = ref<ListUserinfoRequest>({ page: 1, pageSize: 10 });
const userinfos = ref<Userinfo[]>([]);
const searchUserinfos = ref<Result[]>([]);
const addUserinfoVisible = ref(false);
type Type = CreateUserinfoRequest | UpdateUserinfoRequest;
const addUserinfoForm = ref<Type>({} as Type);
const userinfoColumns = ref<TableColumn[]>([
	{
		title: '标识',
		dataIndex: 'keyword'
	},
	{
		title: '名称',
		dataIndex: 'name'
	},
	{
		title: '值',
		dataIndex: 'value'
	},
	{
		title: '创建时间',
		dataIndex: 'createdAt',
		slotName: 'createdAt'
	},
	{
		title: '更新时间',
		dataIndex: 'updatedAt',
		slotName: 'updatedAt'
	},
	{
		title: '操作',
		slotName: 'operations',
		fixed: 'right',
		width: 150
	}
]);

const searchFieldFactory = new Search(
	searchUserinfos.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListField({ ...req, status: true, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: `${item.name}(${item.keyword})`, value: item.keyword });
		});
		return res;
	},
	(val): boolean => {
		return addUserinfoForm.value.keyword === val;
	}
);

const handleClickAddUserUserinfo = () => {
	isAdd.value = true;
	addUserinfoForm.value = {} as CreateUserinfoRequest;
	searchFieldFactory.Search();
	addUserinfoVisible.value = true;
};

const handleGetUserinfos = async () => {
	const { data } = await ListUserinfo({ ...userinfoSearchParams.value, userId: props.userId });
	userinfos.value = data.list;
	userinfoTotal.value = data.total;
};

const handleSubmit = async () => {
	const isError = await addUserinfoFormRef.value.validate();
	if (isError) {
		return false;
	}

	if (isAdd.value) {
		await CreateUserinfo({ ...addUserinfoForm.value, userId: props.userId });
		handleGetUserinfos();
		Message.success('添加成功');
	} else {
		await UpdateUserinfo(addUserinfoForm.value as UpdateUserinfoRequest);
		handleGetUserinfos();
		Message.success('修改成功');
	}

	return true;
};

const deleteUserUserinfo = async (id: number) => {
	await DeleteUserinfo({ ids: [id] });
	handleGetUserinfos();
	Message.success('删除成功');
};

const handleUserinfoPageSizeChange = (val: number) => {
	userinfoSearchParams.value.pageSize = val;
	handleGetUserinfos();
};

const handleUserinfoPageChange = (val: number) => {
	userinfoSearchParams.value.page = val;
	handleGetUserinfos();
};

const handleClickUpdate = (value: Userinfo) => {
	isAdd.value = false;
	addUserinfoForm.value = value;
	addUserinfoVisible.value = true;
};

onMounted(() => {
	handleGetUserinfos();
});
</script>

<style lang="less" scoped>
.content {
	height: 350px;
}

.point {
	cursor: pointer;
}

.close {
	position: absolute;
	top: 10px;
	right: 10px;
	cursor: pointer;
}
</style>
