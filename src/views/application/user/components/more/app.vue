<template>
	<div class="content">
		<a-button v-permission="'application:auth:add'" style="margin-bottom: 15px" type="primary" @click="handleClickAddUserApp">
			<template #icon>
				<icon-plus />
			</template>
			新增应用
		</a-button>
		<a-table
			:scroll="{
				y: '100%'
			}"
			:columns="appColumns"
			:pagination="false"
			:data="apps"
			:bordered="false"
		>
			<template #logo="{ record }">
				<a-avatar v-if="record.app.logo" alt="avatar" :size="38" shape="square">
					<img alt="avatar" :src="$rurl(record.app.logo, 100, 100)" />
				</a-avatar>
				<a-avatar v-else :style="{ backgroundColor: '#3370ff' }" :size="48" shape="square">
					<span>{{ record.app.name }}</span>
				</a-avatar>
			</template>

			<template #status="{ record }">
				<a-space>
					<a-switch
						v-model="record.status"
						:disabled="!$hasPermission('application:auth:update:status')"
						type="round"
						@change="updateUserAppStatus(record)"
					>
						<template #checked>启用</template>
						<template #unchecked>禁用</template>
					</a-switch>
					<a-tooltip v-if="!record.status" :content="record.disableDesc"><icon-question-circle /></a-tooltip>
				</a-space>
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #loggedAt="{ record }">
				{{ $formatTime(record.loggedAt) }}
			</template>
			<template #expiredAt="{ record }">
				{{ $formatTime(record.expiredAt) }}
			</template>
			<template #operations="{ record }">
				<a-popconfirm content="您确认取消用户授权的此应用" type="warning" @ok="deleteUserApp(record.appId)">
					<a-tag v-permission="'application:auth:delete'" color="red" class="cursor-pointer">
						<template #icon><icon-delete /></template>
						取消授权
					</a-tag>
				</a-popconfirm>
			</template>
		</a-table>
	</div>
	<a-pagination
		:total="appTotal"
		:current="appSearchParams.page"
		:page-size="appSearchParams.pageSize"
		show-total
		show-jumper
		show-page-size
		@change="handleAppPageChange"
		@page-size-change="handleAppPageSizeChange"
	/>

	<a-modal v-model:visible="addAppVisible" title="请选择新增应用" :width="300" @cancel="addAppVisible = false" @before-ok="handleAddUserApp">
		<a-select
			v-model="addAppForm.appId"
			placeholder="请选择应用"
			:scrollbar="true"
			:options="searchApps"
			@search="searchFieldFactory.Search"
			@dropdown-reach-bottom="searchFieldFactory.NextSearch"
		></a-select>
	</a-modal>
	<a-modal v-model:visible="disableVisible" simple title="禁用用户应用权限" @cancel="handleCancelDisable" @before-ok="handleDisable">
		<a-form ref="disableVisibleRef" :model="disableForm" layout="vertical">
			<a-form-item
				field="disableDesc"
				label="禁用原因"
				:rules="[
					{
						required: true,
						message: '禁用原因是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="disableForm.disableDesc" placeholder="请输入禁用原因" />
			</a-form-item>
		</a-form>
	</a-modal>
</template>

<script lang="ts" setup>
import { ListApp } from '@/api/application/app/api';
import { CreateAuth, DeleteAuth, ListAuth, UpdateAuthStatus } from '@/api/application/auth/api';
import { Auth, ListAuthRequest } from '@/api/application/auth/type';
import { TableColumn } from '@/types/global';
import { Result, Search } from '@/utils/search';
import { Message, Modal } from '@arco-design/web-vue';
import { ref } from 'vue';

const props = defineProps<{
	userId: number;
}>();

const disableVisible = ref(false);
const disableForm = ref<{ disableDesc?: string }>({});
const curAuth = ref<Auth>();
const disableVisibleRef = ref();

const appTotal = ref(0);
const appSearchParams = ref<ListAuthRequest>({ page: 1, pageSize: 10 });
const apps = ref<Auth[]>([]);
const searchApps = ref<Result[]>([]);
const addAppVisible = ref(false);
type addAppType = { appId: number };
const addAppForm = ref<addAppType>({} as addAppType);
const appColumns = ref<TableColumn[]>([
	{
		title: '应用Logo',
		dataIndex: 'logo',
		slotName: 'logo'
	},
	{
		title: '应用名称',
		dataIndex: 'app.name'
	},
	{
		title: '用户状态',
		slotName: 'status'
	},
	{
		title: '注册时间',
		dataIndex: 'created_at',
		slotName: 'createdAt'
	},
	{
		title: '最近登录',
		dataIndex: 'loggedAt',
		slotName: 'loggedAt'
	},
	{
		title: '过期时间',
		dataIndex: 'expiredAt',
		slotName: 'expiredAt'
	},
	{
		title: '操作',
		slotName: 'operations',
		fixed: 'right'
	}
]);
const searchFieldFactory = new Search(
	searchApps.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListApp({ ...req, status: true, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return addAppForm.value.appId === (val as number);
	}
);
const handleClickAddUserApp = () => {
	searchFieldFactory.Search();
	addAppVisible.value = true;
};
const handleGetApps = async () => {
	const { data } = await ListAuth({ ...appSearchParams.value, userId: props.userId });
	apps.value = data.list;
	appTotal.value = data.total;
};
const handleAddUserApp = async () => {
	await CreateAuth({ userId: props.userId, appId: addAppForm.value.appId });
	handleGetApps();
	Message.success('添加成功');
};
const deleteUserApp = async (appId: number) => {
	await DeleteAuth({ appId, userId: props.userId });
	handleGetApps();
	Message.success('删除成功');
};
const handleAppPageSizeChange = (val: number) => {
	appSearchParams.value.pageSize = val;
	handleGetApps();
};
const handleAppPageChange = (val: number) => {
	appSearchParams.value.page = val;
	handleGetApps();
};

const updateUserAppStatus = (record: Auth) => {
	if (!record.status) {
		curAuth.value = record;
		disableVisible.value = true;
		disableForm.value = {};
		return;
	}
	const status = record.status ? '启用' : '禁用';
	Modal.info({
		title: '状态变更提示',
		content: () => `您确认要 '${status}'此用户？`,
		closable: true,
		hideCancel: false,
		onOk: async () => {
			await UpdateAuthStatus({ id: record.id, status: record.status as boolean });
			Message.success(`${status}成功`);
		},
		onCancel: () => {
			record.status = !record.status;
		}
	});
};

const handleDisable = async () => {
	if (!curAuth.value) return;
	const user = curAuth.value;
	UpdateAuthStatus({ id: user.id, status: user.status as boolean, disableDesc: disableForm.value.disableDesc as string })
		.then(() => {
			user.disableDesc = disableForm.value.disableDesc;
			Message.success(`禁用成功`);
		})
		.catch(() => {
			user.status = !user.status;
		});
};

const handleCancelDisable = () => {
	disableVisible.value = false;
	if (!curAuth.value) return;
	const user = curAuth.value;
	user.status = !user.status;
};

onMounted(() => {
	handleGetApps();
});
</script>

<style lang="less" scoped>
.content {
	height: 350px;
}

.close {
	position: absolute;
	top: 10px;
	right: 10px;
	cursor: pointer;
}
</style>
