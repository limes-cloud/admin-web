<template>
	<div class="container">
		<Breadcrumb />
		<div class="general-card">
			<Search @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd" @classify="handleShowClassify"></Tool>
			<Table
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				@add="handleTableAdd"
				@update="handleTableUpdate"
				@refresh="handleGet"
				@role="handleRole"
			></Table>
			<Form ref="formRef" :jobs="tableData" @refresh="handleGet"></Form>
		</div>
		<a-modal
			v-model:visible="showRole"
			title="角色绑定"
			:modal-style="{ width: '400px' }"
			:body-style="{ padding: 0, height: '60%', minHeight: '500px', display: 'flex', flexDirection: 'column' }"
			:footer="false"
			unmount-on-close
		>
			<Role :job-id="jobId" />
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Job, ListJobRequest } from '@/api/manager/job/type';
import { ListJob } from '@/api/manager/job/api';

import Search from './components/search.vue';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Role from './role/index.vue';

const jobId = ref<number>(0);
const showRole = ref(false);
const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const showGroup = ref(false);
const searchForm = ref<ListJobRequest>({
	page: 1,
	pageSize: 10
});

const columns = ref<TableColumn[]>([
	{
		title: '职位标识',
		dataIndex: 'keyword'
	},
	{
		title: '职位名称',
		dataIndex: 'name'
	},
	{
		title: '职位描述',
		dataIndex: 'description'
	},
	{
		title: '创建时间',
		slotName: 'createdAt'
	},
	{
		title: '更新时间',
		slotName: 'updatedAt'
	},
	{
		title: '操作',
		slotName: 'operations'
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListJob(searchForm.value);
		tableData.value = data.list;
	} finally {
		setLoading(false);
	}
};

handleGet();

const handleSearch = async (req: ListJobRequest) => {
	searchForm.value = {
		...searchForm.value,
		...req
	};

	handleGet();
};

//  处理tool按钮新建
const handleToolAdd = () => {
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Job) => {
	formRef.value.showUpdateDrawer(data);
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	formRef.value.showAddDrawer({ parentId: id });
};

const handleShowClassify = () => {
	showGroup.value = true;
};

const handleRole = (data: Job) => {
	jobId.value = data.id;
	showRole.value = true;
};
</script>

<script lang="ts">
export default {
	name: 'ManagerJob'
};
</script>
