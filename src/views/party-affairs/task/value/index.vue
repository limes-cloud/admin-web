<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @select="handleSelect"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @export="handleExport"></Tool>
			<Table
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				:total="total"
				:pagination="{
					current: searchForm.page,
					pageSize: searchForm.page_size
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
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';
import { PageTaskValueReq, Task, TaskValue } from '@/api/party-affairs/types/task';
import { pageTaskValue, deleteTaskValue, getTask, exportTaskValue } from '@/api/party-affairs/task';
import { getFileBySha } from '@/api/resource/file';
import Table from './components/table.vue';
import Search from './components/search.vue';
import Tool from './components/tool.vue';
import More from './components/more.vue';

const { setLoading } = useLoading(true);
const moreRef = ref();
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const task = ref<Task>();
const taskValueArr = ref<any[]>([]);
const searchForm = ref<PageTaskValueReq>({
	page: 1,
	page_size: 10,
	task_id: 0
});

const columns = ref<TableCloumn[]>([
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
		const { data } = await pageTaskValue(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

// 处理查询
const handleSelect = async (taskId: number) => {
	const pageSize = searchForm.value.page_size;
	searchForm.value = {
		task_id: taskId,
		page: 1,
		page_size: pageSize
	};

	handleGet();
	getTask(searchForm.value.task_id).then((res) => {
		task.value = res.data;
	});
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.current;
	searchForm.value.page_size = page.pageSize;
	handleGet();
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteTaskValue(id);
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
			resource: undefined
		};

		if (item.type === 'upload' && temp.value) {
			const { data } = await getFileBySha(temp.value as string);
			temp.resource = data as any;
		}
		taskValueArr.value.push(temp);
	});
	moreRef.value.show();
};

const handleExport = async () => {
	if (!searchForm.value.task_id) {
		Message.error('请先选择需要导出的任务');
		return;
	}
	await exportTaskValue(searchForm.value.task_id);
	Message.success('导出成功，请稍后在资源服务中进行查看');
};
</script>

<script lang="ts">
export default {
	name: 'ManagerTaskValue'
};
</script>
