<template>
	<div>
		<a-space direction="vertical" fill>
			<a-table
				v-permission="'application:feedback:query'"
				row-key="id"
				:loading="loading"
				:columns="columns"
				:data="data"
				:bordered="false"
				:pagination="false"
				:size="size"
			>
				<template #group="{ record }">
					<template v-if="record.group">{{ record.group.name }}</template>
					<template v-else>暂无分类</template>
				</template>

				<template #user="{ record }">
					{{ record.user.realName ? record.user.nickName + '(' + record.user.realName + ')' : record.user.nickName }}
				</template>

				<template #status="{ record }">
					<a-tag :color="getStatusLabel(record.status).color">{{ getStatusLabel(record.status).label }}</a-tag>
				</template>

				<template #createdAt="{ record }">
					{{ $formatTime(record.createdAt) }}
				</template>
				<template #updatedAt="{ record }">
					{{ $formatTime(record.updatedAt) }}
				</template>

				<template #operations="{ record }">
					<a-space class="cursor-pointer">
						<a-tag v-permission="'application:feedback:query'" color="arcoblue" @click="handleMore(record)">
							<template #icon><icon-more /></template>
							详情
						</a-tag>

						<a-tag v-permission="'application:feedback:update'" color="orangered" @click="handleProcessed(record)">
							<template #icon><icon-edit /></template>
							处理
						</a-tag>

						<a-popconfirm content="您确认删除此反馈？" type="warning" @ok="handleDelete(record.id)">
							<a-tag v-permission="'application:feedback:delete'" color="red">
								<template #icon><icon-delete /></template>
								删除
							</a-tag>
						</a-popconfirm>
					</a-space>
				</template>
			</a-table>
			<a-pagination
				:total="total"
				:current="page.page"
				:page-size="page.pageSize"
				show-total
				show-jumper
				show-page-size
				@change="pageChange"
				@page-size-change="pageSizeChange"
			/>
		</a-space>
		<a-modal v-model:visible="showProcess" title="反馈处理" width="480px" @before-ok="handleUpdate">
			<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
				<a-form-item
					field="status"
					label="处理状态"
					:rules="[
						{
							required: true,
							message: '处理状态是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-select v-model="form.status" placeholder="请选择处理结果">
						<template v-for="(item, index) in statusList" :key="index">
							<a-option v-if="item.type != 'untreated'" :value="item.type">{{ item.label }}</a-option>
						</template>
					</a-select>
				</a-form-item>
				<a-form-item
					field="processedResult"
					label="处理结果"
					:rules="[
						{
							required: true,
							message: '处理结果是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-textarea v-model="form.processedResult" allow-clear placeholder="请输入处理结果" />
				</a-form-item>
			</a-form>
		</a-modal>

		<a-modal v-model:visible="showMore" title="反馈详情" width="680px" :body-style="{ height: '500px' }" unmount-on-close>
			<a-space direction="vertical" size="large" fill>
				<a-descriptions title="基础信息" :column="{ xs: 2, md: 2, lg: 2 }">
					<a-descriptions-item :span="1" label="问题分类">{{ curFeedback?.category?.name }}</a-descriptions-item>
					<a-descriptions-item :span="1" label="所属应用">{{ curFeedback?.app?.name }}</a-descriptions-item>
					<a-descriptions-item :span="1" label="反馈用户">
						{{ curFeedback?.user?.realName ? curFeedback?.user?.nickName + '(' + curFeedback?.user?.realName + ')' : curFeedback?.user?.nickName }}
					</a-descriptions-item>
					<a-descriptions-item :span="1" label="联系方法">{{ curFeedback?.contact ? curFeedback?.contact : '暂无' }}</a-descriptions-item>
					<a-descriptions-item :span="1" label="使用渠道">{{ getPlatformNane(curFeedback?.platform) }}</a-descriptions-item>
					<a-descriptions-item :span="1" label="应用版本">{{ curFeedback?.version }}</a-descriptions-item>
				</a-descriptions>

				<a-descriptions title="设备信息" :column="{ xs: 2, md: 2, lg: 2 }">
					<a-descriptions-item :span="1" label="浏览器">
						{{ curFeedback?.deviceInfo?.browserName + '（' + curFeedback?.deviceInfo?.browserVersion + '）' }}
					</a-descriptions-item>
					<a-descriptions-item :span="1" label="设备类型">{{ curFeedback?.deviceInfo?.deviceType }}</a-descriptions-item>
					<a-descriptions-item :span="1" label="操作系统">
						{{ curFeedback?.deviceInfo?.platform + '（' + curFeedback?.deviceInfo?.system + '）' }}
					</a-descriptions-item>
					<a-descriptions-item :span="1" label="屏幕信息">
						{{ curFeedback?.deviceInfo?.screenWidth + ' x ' + curFeedback?.deviceInfo?.screenHeight }}（
						{{ curFeedback?.deviceInfo?.orientation == 'portrait' ? '竖屏' : '横屏' }}）
					</a-descriptions-item>
					<a-descriptions-item :span="2" label="用户代理">{{ curFeedback?.deviceInfo?.userAgent }}</a-descriptions-item>
				</a-descriptions>

				<a-descriptions title="反馈信息" :column="{ xs: 2, md: 2, lg: 2 }">
					<a-descriptions-item :span="2" label="标题">{{ curFeedback?.title }}</a-descriptions-item>
					<a-descriptions-item :span="2" label="内容">{{ curFeedback?.content }}</a-descriptions-item>
					<a-descriptions-item :span="2" label="截图">
						<a-space>
							<template v-for="(url, index) in curFeedback?.imageUrls" :key="index">
								<a-image width="100" :src="url" />
							</template>
						</a-space>

						<a-empty v-if="!curFeedback?.imageUrls.length">
							<template #image>
								<svgIcon name="empty-data" :size="100" />
							</template>
							未上传截图
						</a-empty>
					</a-descriptions-item>
				</a-descriptions>
			</a-space>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { TableSize, TableColumn, Pagination } from '@/types/global';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';
import { Feedback } from '@/api/application/feedback/type';
import { DeleteFeedback, UpdateFeedback } from '@/api/application/feedback/api';
import { Message } from '@arco-design/web-vue';
import { ListChannelType } from '@/api/application/channel/api';
import statusList from './status';

const showMore = ref(false);
const showProcess = ref(false);
const emit = defineEmits(['refresh', 'update', 'pageChange']);

const props = defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	pagination: Pagination;
	total: number;
}>();

const channelTypes = ref<Record<string, string>>({});
const curFeedback = ref<Feedback>();
const formRef = ref();
const form = ref({ id: 0, status: '', processedResult: '' });
const page = ref<Pagination>({
	page: 1,
	pageSize: 10
});

watch(
	() => props.pagination,
	(val) => {
		page.value = { ...val };
	},
	{ deep: true, immediate: true }
);

const handleGetTypes = async () => {
	const { data } = await ListChannelType();
	data.list.forEach((item) => {
		channelTypes.value[item.keyword] = item.name;
	});
};

handleGetTypes();

const getPlatformNane = (p?: string) => {
	if (!p) return '';
	if (p === 'h5') {
		return '浏览器';
	}
	return channelTypes[p] ? channelTypes[p] : '未知';
};

const pageChange = (current: number) => {
	page.value.page = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};

const handleDelete = async (id: number) => {
	await DeleteFeedback({ id });
	Message.success('删除成功');
	emit('refresh');
};

const getStatusLabel = (val: string) => {
	let tp = statusList[0];
	statusList.forEach((item) => {
		if (item.type === val) {
			tp = item;
		}
	});
	return tp;
};

const handleProcessed = (record: Feedback) => {
	showProcess.value = true;
	form.value = { id: record.id, status: '', processedResult: '' };
	if (record.processedResult) {
		form.value.processedResult = record.processedResult as string;
		form.value.status = record.status;
	}
};

const handleUpdate = async () => {
	await UpdateFeedback({ ...form.value });
	Message.success('处理成功！');
	emit('refresh');
	return true;
};

const handleMore = async (record: Feedback) => {
	curFeedback.value = record;
	curFeedback.value.deviceInfo = JSON.parse(curFeedback.value.device);
	showMore.value = true;
};
</script>
