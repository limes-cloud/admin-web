<template>
	<a-modal v-model:visible="visible" hide-title :width="700" hide-cancel @cancel="visible = false">
		<a-tabs>
			<a-tab-pane key="app">
				<template #title>
					<icon-apps />
					应用列表
				</template>
				<div class="content">
					<!-- v-permission="'uc:user:add:app'" -->
					<a-button style="margin-bottom: 15px" type="primary" @click="handleAddUserApp">
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
						:data="props.user.apps"
						:bordered="false"
					>
						<template #logo="{ record }">
							<a-avatar v-if="record.resource" alt="avatar" :size="38" shape="square">
								<img alt="avatar" :src="$rurl(record.resource.src, 100, 100)" />
							</a-avatar>
							<a-avatar v-else :style="{ backgroundColor: '#3370ff' }" :size="48" shape="square">
								<span>{{ record.name }}</span>
							</a-avatar>
						</template>

						<template #createdAt="{ record }">
							{{ $formatTime(record.created_at) }}
						</template>
						<template #loginAt="{ record }">
							{{ $formatTime(record.login_at) }}
						</template>
						<template #operations="{ record }">
							<a-popconfirm content="您确认删除用户的此应用" type="warning" @ok="deleteApp(record.id)">
								<!-- v-permission="'uc:user:app:delete'" -->
								<a-tag color="red" class="cursor-pointer">
									<template #icon><icon-delete /></template>
									删除
								</a-tag>
							</a-popconfirm>
						</template>
					</a-table>
				</div>
			</a-tab-pane>
			<a-tab-pane key="auth">
				<template #title>
					<icon-mind-mapping />
					渠道列表
				</template>
				<div class="content">
					<a-table
						:scroll="{
							y: '100%'
						}"
						:columns="channelColumns"
						:pagination="false"
						:data="props.user.channels"
						:bordered="false"
					>
						<template #logo="{ record }">
							<a-avatar v-if="record.resource" alt="avatar" :size="38" shape="square">
								<img alt="avatar" :src="$rurl(record.resource.src, 100, 100)" />
							</a-avatar>
							<a-avatar v-else :style="{ backgroundColor: '#3370ff' }" :size="48" shape="square">
								<span>{{ record.name }}</span>
							</a-avatar>
						</template>
						<template #name="{ record }">
							{{ record.name }}
						</template>
						<template #createdAt="{ record }">
							{{ $formatTime(record.created_at) }}
						</template>
						<template #loginAt="{ record }">
							{{ $formatTime(record.login_at) }}
						</template>
					</a-table>
				</div>
			</a-tab-pane>
			<a-tab-pane key="extra">
				<template #title>
					<icon-list />
					扩展信息
				</template>
				<div class="content">
					<a-table
						:scroll="{
							y: '100%'
						}"
						:columns="extraColumns"
						:pagination="false"
						:data="props.user.extra_list"
						:bordered="false"
					></a-table>
				</div>
			</a-tab-pane>
		</a-tabs>
	</a-modal>

	<a-modal v-model:visible="addAppVisible" title="请选择新增应用" :width="300" @cancel="addAppVisible = false" @ok="addUserApp">
		<a-select
			v-model="appId"
			placeholder="请选择应用"
			:max-tag-count="2"
			:scrollbar="true"
			:options="innerApps"
			:field-names="{ value: 'id', label: 'name', disabled: 'disabled' }"
		></a-select>
	</a-modal>
</template>

<script lang="ts" setup>
import { pageApp } from '@/api/user-center/app';
import { App } from '@/api/user-center/types/app';
import { User } from '@/api/user-center/types/user';
import { TableCloumn } from '@/types/global';
import { ref } from 'vue';

const props = defineProps<{
	user: User;
}>();
const emit = defineEmits(['addApp', 'deleteApp']);

const visible = ref(false);

const appId = ref();
const addAppVisible = ref(false);
type SelectApp = App & { disabled: boolean };
const innerApps = ref<SelectApp[]>([]);

const appColumns = ref<TableCloumn[]>([
	{
		title: '应用Logo',
		dataIndex: 'logo',
		slotName: 'logo'
	},
	{
		title: '应用名称',
		dataIndex: 'name'
	},
	{
		title: '注册时间',
		dataIndex: 'created_at',
		slotName: 'createdAt'
	},
	{
		title: '最近登录',
		dataIndex: 'login_at',
		slotName: 'loginAt'
	},
	{
		title: '操作',
		slotName: 'operations',
		fixed: 'right'
	}
]);

const channelColumns = ref<TableCloumn[]>([
	{
		title: '渠道Logo',
		dataIndex: 'logo',
		slotName: 'logo'
	},
	{
		title: '渠道名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '授权时间',
		dataIndex: 'created_at',
		slotName: 'createdAt'
	},
	{
		title: '最近登录',
		dataIndex: 'login_at',
		slotName: 'loginAt'
	}
]);

const extraColumns = ref<TableCloumn[]>([
	{
		title: '关键词',
		dataIndex: 'keyword'
	},
	{
		title: '名称',
		dataIndex: 'name'
	},
	{
		title: '类型',
		dataIndex: 'type_name'
	},
	{
		title: '扩展值',
		dataIndex: 'value'
	}
]);

const show = () => {
	visible.value = true;
};

const close = () => {
	visible.value = false;
};

defineExpose({ show, close });

const searchApp = async () => {
	innerApps.value = [];
	const ids = props.user.apps.map((obj) => obj.id);
	const { data } = await pageApp({ page: 1, page_size: 50 });
	const { list } = data;
	if (!list) {
		return;
	}
	list.forEach((item) => {
		innerApps.value.push({ ...item, disabled: ids.includes(item.id) });
	});
};

const handleAddUserApp = () => {
	searchApp();
	addAppVisible.value = true;
};

const addUserApp = () => {
	emit('addApp', { app_id: appId.value, user_id: props.user.id });
};

const deleteApp = (id: number) => {
	emit('deleteApp', { app_id: id, user_id: props.user.id });
};
</script>

<style lang="less" scoped>
.content {
	height: 350px;
	// overflow-y: scroll;
}
</style>
