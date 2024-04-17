<template>
	<div class="flex">
		<div class="left">
			<div class="logs">
				<div v-for="item in list" :key="item.id" class="item" :class="id == item.id ? 'item-act' : ''" @click="handleSwitchLog(item.id)">
					<a-tooltip :content="item.uuid">
						<div class="title">标识：{{ item.uuid.substring(0, 12) }}</div>
					</a-tooltip>
					<div class="title">开始：{{ $parseTime(item.start) }}</div>
					<div class="title">结束：{{ $parseTime(item.start) }}</div>
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
			</div>
			<div class="page">
				<a-pagination
					size="mini"
					:total="total"
					:current="params.page"
					:page-size="params.page_size"
					simple
					@change="pageChange"
					@page-size-change="pageSizeChange"
				/>
			</div>
		</div>
		<div class="code">
			<template v-for="(item, index) in content" :key="index">
				<div v-if="item.type == 'info'" class="info">{{ $parseTime(item.time) }}：{{ item.content }}</div>
				<div v-if="item.type == 'error'" class="error">{{ $parseTime(item.time) }}：{{ item.content }}</div>
			</template>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { getLog, pageLog } from '@/api/cron/log';
import { cancelTask } from '@/api/cron/task';
import { Log, LogMsg, PageLogReq } from '@/api/cron/types/log';
import { ref, reactive } from 'vue';

const props = defineProps<{
	id: number;
}>();

const id = ref(0);
const total = ref(0);
const list = ref<Log[]>([]);
const params = reactive<PageLogReq>({
	page: 1,
	page_size: 10,
	task_id: props.id
});

const content = ref<LogMsg[]>([]);
const isRunning = ref(false);

const handleSwitchLog = async (v: number) => {
	id.value = v;
	const { data } = await getLog(id.value);
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
	const { data } = await pageLog(params);
	list.value = data.list;
	total.value = data.total;
	if (data.list && !id.value) {
		id.value = data.list[0].id;
		handleSwitchLog(id.value);
	}
};
handlePageLog();
setInterval(() => {
	handlePageLog();
}, 10000);

setInterval(() => {
	if (id.value && isRunning.value) {
		handleSwitchLog(id.value);
	}
}, 1000);

const pageChange = (current: number) => {
	params.page = current;
	handlePageLog();
};

const pageSizeChange = (size: number) => {
	params.page_size = size;
	handlePageLog();
};

const handleCancel = (val: string) => {
	cancelTask(val).then(() => {
		handlePageLog();
	});
};
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
			height: calc(100% - 40px);
			overflow: scroll;

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
