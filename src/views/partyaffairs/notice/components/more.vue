<template>
	<a-modal v-model:visible="visible" hide-title :width="700" hide-cancel @cancel="visible = false">
		<a-tabs @change="switchUser">
			<a-tab-pane key="yes">
				<template #title>
					<icon-apps />
					已读列表
				</template>
			</a-tab-pane>
			<a-tab-pane key="no">
				<template #title>
					<icon-mind-mapping />
					未读列表
				</template>
			</a-tab-pane>
		</a-tabs>
		<a-space direction="vertical" fill>
			<a-table v-permission="'uc:user:query'" row-key="id" :columns="columns" :data="list" :bordered="false" :pagination="false">
				<template #avatar="{ record }">
					<a-avatar>
						<img v-if="!record.avatar" alt="avatar" :src="$logo" />
						<img v-else alt="avatar" :src="$rurl(record.resource?.url)" />
					</a-avatar>
				</template>

				<template #gender="{ record }">
					<a-tag v-if="record.gender == 'M'" color="arcoblue">
						<template #icon><icon-man /></template>
						{{ $genderList[record.gender] }}
					</a-tag>
					<a-tag v-if="record.gender == 'F'" color="red">
						<template #icon><icon-woman /></template>
						{{ $genderList[record.gender] }}
					</a-tag>
				</template>
			</a-table>
			<a-pagination
				:total="total"
				:current="form.page"
				:page-size="form.page_size"
				show-total
				show-jumper
				show-page-size
				@change="pageChange"
				@page-size-change="pageSizeChange"
			/>
		</a-space>
	</a-modal>
</template>

<script lang="ts" setup>
import { pageNoticeUser } from '@/api/partyaffairs/notice';
import { SimpleUser, TableColumn } from '@/types/global';
import { reactive, ref } from 'vue';

const list = ref<SimpleUser[]>([]);
const visible = ref(false);
const total = ref(0);

const form = reactive({
	page: 1,
	page_size: 10,
	notice_id: 0,
	is_read: true
});

const columns = ref<TableColumn[]>([
	{
		title: '头像',
		dataIndex: 'avatar',
		slotName: 'avatar'
	},
	{
		title: '昵称',
		dataIndex: 'nickName'
	},
	{
		title: '姓名',
		dataIndex: 'realName'
	}
]);

const pageUser = async () => {
	const { data } = await pageNoticeUser({
		...form
	});
	total.value = data.total;
	list.value = list.value.concat(data.list);
};

const switchUser = (val: any) => {
	form.is_read = val === 'yes';
	list.value = [];
	pageUser();
};

const pageChange = (current: number) => {
	form.page = current;
	pageUser();
};

const pageSizeChange = (size: number) => {
	form.page_size = size;
	pageUser();
};

const show = (id: number) => {
	visible.value = true;
	form.notice_id = id;
	list.value = [];
	pageUser();
};

const close = () => {
	visible.value = false;
};

defineExpose({ show, close });
</script>

<style lang="less" scoped>
.content {
	height: 350px;
	// overflow-y: scroll;
}
</style>
