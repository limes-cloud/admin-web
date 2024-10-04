<template>
	<div class="container">
		<a-card class="general-card">
			<Search @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @export="handleExport"></Tool>
			<Table
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				:total="total"
				:pagination="{
					page: searchForm.page,
					pageSize: searchForm.pageSize
				}"
				@page-change="handlePageChange"
				@delete="handleDelete"
				@more="handleMore"
			></Table>
			<More ref="moreRef" :data="taskValueArr"></More>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';
import { GetFile } from '@/api/resource/file/api';
import { ListTaskValueRequest, Task, TaskValue } from '@/api/partyaffairs/task/type';
import { ListTaskValue, DeleteTaskValue, ExportTaskValue, GetTask } from '@/api/partyaffairs/task/api';
import Table from './components/table.vue';
import Search from './components/search.vue';
import Tool from './components/tool.vue';
import More from './components/more.vue';

const props = defineProps<{ taskId: number }>();
const { setLoading } = useLoading(true);
const moreRef = ref();
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const task = ref<Task>();
const taskValueArr = ref<any[]>([]);
const searchForm = ref<ListTaskValueRequest>({
	page: 1,
	pageSize: 10,
	taskId: props.taskId
});

watch(
	() => props.taskId,
	(val) => {
		searchForm.value.taskId = props.taskId;
	}
);

const columns = ref<TableColumn[]>([
	{
		title: '用户ID',
		slotName: 'userId'
	},
	{
		title: '姓名',
		slotName: 'name'
	},
	{
		title: '电话',
		slotName: 'phone'
	},
	{
		title: '邮箱',
		slotName: 'email'
	},
	{
		title: '填写时间',
		dataIndex: 'created_at',
		slotName: 'createdAt'
	},
	{
		title: '更新时间',
		dataIndex: 'updated_at',
		slotName: 'updatedAt'
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations',
		fixed: 'right',
		width: 100
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListTaskValue(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

const handleGetTask = async () => {
	const { data } = await GetTask(props.taskId);
	task.value = data as Task;
};

handleGet();
handleGetTask();

// 处理查询
const handleSearch = async (val) => {
	searchForm.value = {
		...searchForm.value,
		...val
	};
	handleGet();
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.page;
	searchForm.value.pageSize = page.pageSize;
	handleGet();
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await DeleteTaskValue(id);
	handleGet();
	Message.success('删除成功');
};

const handleMore = async (tv: TaskValue) => {
	const value = JSON.parse(tv.value);
	const components = JSON.parse(task.value?.config as string);
	taskValueArr.value = [];
	// 转换为数组
	components.forEach(async (item) => {
		const temp = {
			label: item.config.label,
			field: item.field,
			value: value[item.field],
			resource: undefined,
			fileType: undefined
		};

		if (item.type === 'upload' && temp.value) {
			const { data } = await GetFile({ sha: temp.value as string });
			temp.resource = data as any;
			temp.fileType = item.config?.filetype;
		}

		taskValueArr.value.push(temp);
	});
	moreRef.value.show();
};

const handleExport = async () => {
	if (!searchForm.value.taskId) {
		Message.error('请先选择需要导出的任务');
		return;
	}
	await ExportTaskValue(searchForm.value.taskId);
	Message.success('导出成功，请稍后在资源服务中进行查看');
};
</script>

<script lang="ts">
export default {
	name: 'ManagerTaskValue'
};
</script>
