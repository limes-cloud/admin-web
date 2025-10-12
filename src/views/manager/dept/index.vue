<template>
	<div class="container">
		<Breadcrumb />
		<div class="general-card">
			<Search @search="handleSearch"></Search>
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd" @classify="handleShowClassify"></Tool>
			<Table
				:columns="columns"
				:loading="loading"
				:data="list"
				:size="size"
				@add="handleTableAdd"
				@update="handleTableUpdate"
				@refresh="handleGet"
				@role="handleRole"
			></Table>
			<Form ref="formRef" :depts="list" @refresh="handleGet"></Form>
		</div>
		<a-modal
			v-model:visible="showGroup"
			title="部门分类"
			:modal-style="{ width: '80%', maxWidth: '550px' }"
			:body-style="{ padding: 0 }"
			unmount-on-close
			:footer="false"
		>
			<Classify />
		</a-modal>
		<a-modal
			v-model:visible="showRole"
			title="角色绑定"
			:modal-style="{ width: '400px' }"
			:body-style="{ padding: 0, height: '60%', minHeight: '500px', display: 'flex', flexDirection: 'column' }"
			:footer="false"
			unmount-on-close
		>
			<Role :dept-id="deptId" />
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableColumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Dept, ListDeptRequest } from '@/api/manager/dept/type';
import { ListCurrentDept } from '@/api/manager/dept/api';

import Search from './components/search.vue';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Classify from './classify/index.vue';
import Role from './role/index.vue';

const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const list = ref<Dept[]>();
const size = ref<TableSize>('medium');
const showGroup = ref(false);
const showRole = ref(false);
const searchForm = ref<ListDeptRequest>({});
const deptId = ref<number>(0);

const columns = ref<TableColumn[]>([
	{
		title: '部门名称',
		dataIndex: 'name'
	},
	{
		title: '部门分类',
		dataIndex: 'classify.name'
	},
	{
		title: '部门描述',
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
		const { data } = await ListCurrentDept(searchForm.value);
		list.value = data.list;
	} finally {
		setLoading(false);
	}
};

handleGet();

const handleSearch = async (req: ListDeptRequest) => {
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
const handleTableUpdate = (data: Dept) => {
	formRef.value.showUpdateDrawer(data);
};

const handleRole = (data: Dept) => {
	deptId.value = data.id;
	showRole.value = true;
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	formRef.value.showAddDrawer({ parentId: id });
};

const handleShowClassify = () => {
	showGroup.value = true;
};
</script>

<script lang="ts">
export default {
	name: 'ManagerDept'
};
</script>
