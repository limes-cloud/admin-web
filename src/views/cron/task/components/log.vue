<template>
	<div class="flex">
		<div class="left">
			<div class="logs">
				<div v-for="item in list" :key="item.id" class="item" :class="id == item.id ? 'item-act' : ''" @click="handleSwitchLog(item.id)">
					<a-tooltip :content="item.uuid">
						<div class="title">标识：{{ item.uuid.substring(0, 12) }}</div>
					</a-tooltip>
					<div class="title">开始：{{ $parseTime(item.startAt) }}</div>
					<div class="title">结束：{{ $parseTime(item.endAt) }}</div>
					<div class="title">
						状态：
						<a-tag v-if="item.status == 'fail'" color="red" size="small">失败</a-tag>
						<a-tag v-if="item.status == 'success'" color="green" size="small">成功</a-tag>
						<a-tag v-if="item.status == 'cancel'" color="orangered" size="small">中止</a-tag>
						<a-space v-if="item.status == 'running'">
							<a-tag color="cyan" size="small">运行中</a-tag>
							<a-popconfirm content="您确认要立即执行此任务？" type="warning" @ok="handleCancel(item.uuid)">
								<a-tag v-permission="'cron:task:cancel'" color="orange" size="small">取消</a-tag>
							</a-popconfirm>
						</a-space>
					</div>
				</div>
				<div v-if="!list.length" class="empty">
					<a-empty>
						<template #image>
							<icon-exclamation-circle-fill />
						</template>
						暂无运行记录
					</a-empty>
				</div>
			</div>
			<div class="page">
				<a-pagination
					size="mini"
					:total="total"
					:current="params.page"
					:page-size="params.pageSize"
					simple
					@change="pageChange"
					@page-size-change="pageSizeChange"
				/>
			</div>
		</div>
		<div class="code">
			<template v-for="(item, index) in content" :key="index">
				<div v-if="item && item.type == 'info'" class="info">{{ $parseTime(item.time) }}：{{ item.content }}</div>
				<div v-if="item && item.type == 'error'" class="error">{{ $parseTime(item.time) }}：{{ item.content }}</div>
			</template>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { GetLog, ListLog } from '@/api/cron/log/api';
import { onBeforeUnmount, ref, reactive } from 'vue';
import { Log, LogMsg, ListLogRequest } from '@/api/cron/log/type';
import { CancelTask } from '@/api/cron/task/api';

const props = defineProps<{
	id: number;
}>();

const id = ref(0);
const total = ref(0);
const list = ref<Log[]>([]);
const params = reactive<ListLogRequest>({
	page: 1,
	pageSize: 10,
	taskId: props.id,
	orderBy: 'id',
	order: 'desc'
});

const content = ref<LogMsg[]>([]);
const isRunning = ref(false);

const handleSwitchLog = async (v: number) => {
	id.value = v;
	const { data } = await GetLog({ id: id.value });
	const str = `[${data.content}]`;
	content.value = JSON.parse(str);
	if (data.status === 'running') {
		isRunning.value = true;
	} else {
		isRunning.value = false;
		list.value.forEach((item, ind) => {
			if (item.id === data.id) {
				list.value[ind] = data;
			}
		});
	}
};

const handlePageLog = async () => {
	const { data } = await ListLog(params);
	list.value = data.list;
	total.value = data.total;
	if (data.list && !id.value) {
		id.value = data.list[0].id;
		handleSwitchLog(id.value);
	}
};
handlePageLog();
const pageTimer = setInterval(() => {
	handlePageLog();
}, 5000);

const runTimer = setInterval(() => {
	if (id.value && isRunning.value) {
		handleSwitchLog(id.value);
	}
}, 1000);

const pageChange = (current: number) => {
	params.page = current;
	handlePageLog();
};

const pageSizeChange = (size: number) => {
	params.pageSize = size;
	handlePageLog();
};

const handleCancel = (val: string) => {
	CancelTask({ uuid: val }).then(() => {
		handlePageLog();
	});
};
onBeforeUnmount(() => {
	clearInterval(pageTimer);
	clearInterval(runTimer);
});
</script>

<style lang="less" scoped>
.flex {
	display: flex;
	height: 100%;

	.left {
		position: relative;
		height: 100%;
		padding: 10px;

		.logs {
			min-width: 200px;
			height: calc(100% - 40px);
			overflow: scroll;

			.empty {
				margin-top: 100px;
			}

			.item {
				margin-bottom: 10px;
				font-size: 12px;
				cursor: pointer;
			}

			.item-act {
				color: rgb(var(--arcoblue-6));
				font-weight: 800;
			}

			&::-webkit-scrollbar {
				display: none;
			}
		}

		.page {
			position: absolute;
			bottom: 15px;
			left: 0;
		}
	}
}

.title {
	white-space: nowrap;
}

.code {
	flex: 1;
	padding: 15px;
	overflow: scroll;
	font-size: 12px;
	background-color: #192638;

	.info {
		color: #ddd;
	}

	.error {
		color: #f44;
	}
}
</style>
