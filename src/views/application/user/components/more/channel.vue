<template>
	<div class="content">
		<a-table
			:scroll="{
				y: '100%'
			}"
			:columns="channelColumns"
			:pagination="false"
			:data="channels"
			:bordered="false"
		>
			<template #logo="{ record }">
				<a-avatar v-if="record.channel.logo" alt="avatar" :size="38" shape="square">
					<img alt="avatar" :src="$rurl(record.channel.logo, 100, 100)" />
				</a-avatar>
				<a-avatar v-else :style="{ backgroundColor: '#3370ff' }" :size="48" shape="square">
					<span>{{ record.channel.name }}</span>
				</a-avatar>
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.createdAt) }}
			</template>
			<template #loggedAt="{ record }">
				{{ $formatTime(record.loggedAt) }}
			</template>
			<template #expiredAt="{ record }">
				{{ $parseTime(record.expiredAt) }}
			</template>
			<template #operations="{ record }">
				<a-popconfirm content="您确认取消绑定此渠道" type="warning" @ok="deleteUserChannel(record.channelId)">
					<a-tag v-permission="'application:oauth:delete'" color="red" class="cursor-pointer">
						<template #icon><icon-delete /></template>
						取消绑定
					</a-tag>
				</a-popconfirm>
			</template>
		</a-table>
	</div>
	<a-pagination
		:total="channelTotal"
		:current="channelSearchParams.page"
		:page-size="channelSearchParams.pageSize"
		show-total
		show-jumper
		show-page-size
		@change="handleChannelPageChange"
		@page-size-change="handleChannelPageSizeChange"
	/>
</template>

<script lang="ts" setup>
import { DeleteOAuth, ListOAuth } from '@/api/application/oauth/api';
import { OAuth, ListOAuthRequest } from '@/api/application/oauth/type';
import { TableColumn } from '@/types/global';
import { Message } from '@arco-design/web-vue';
import { ref } from 'vue';

const props = defineProps<{
	userId: number;
}>();

const channelTotal = ref(0);
const channelSearchParams = ref<ListOAuthRequest>({ page: 1, pageSize: 10 });
const channels = ref<OAuth[]>([]);
const channelColumns = ref<TableColumn[]>([
	{
		title: '渠道Logo',
		dataIndex: 'logo',
		slotName: 'logo'
	},
	{
		title: '渠道名称',
		dataIndex: 'channel.name'
	},
	{
		title: '绑定时间',
		dataIndex: 'createdAt',
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

const handleGetChannels = async () => {
	const { data } = await ListOAuth({ ...channelSearchParams.value, userId: props.userId });
	channels.value = data.list;
	channelTotal.value = data.total;
};

const deleteUserChannel = async (channelId: number) => {
	await DeleteOAuth({ channelId, userId: props.userId });
	handleGetChannels();
	Message.success('解绑成功');
};
const handleChannelPageSizeChange = (val: number) => {
	channelSearchParams.value.pageSize = val;
	handleGetChannels();
};
const handleChannelPageChange = (val: number) => {
	channelSearchParams.value.page = val;
	handleGetChannels();
};

onMounted(() => {
	handleGetChannels();
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
