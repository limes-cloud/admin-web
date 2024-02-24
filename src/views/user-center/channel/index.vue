<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd"></Tool>
			<Table
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				@add="handleTableAdd"
				@update="handleTableUpdate"
				@delete="handleDelete"
			></Table>
			<Form ref="formRef" :platforms="platforms" :data="form" @add="handleAdd" @update="handleUpdate"></Form>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableCloumn, TableSize } from '@/types/global';
import { addChannel, deleteChannel, allChannel, updateChannel, allType } from '@/api/user-center/channel';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';
import { Channel, Type } from '@/api/user-center/types/channel';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';

const formRef = ref();
const form = ref<Channel>({} as Channel);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const platforms = ref<Type[]>([]);

const size = ref<TableSize>('medium');
const columns = ref<TableCloumn[]>([
	{
		title: '渠道logo',
		dataIndex: 'logo',
		slotName: 'logo'
	},
	{
		title: '渠道标识',
		dataIndex: 'platform',
		slotName: 'platform'
	},
	{
		title: '渠道名称',
		dataIndex: 'name',
		slotName: 'name'
	},
	{
		title: '渠道ak',
		dataIndex: 'ak',
		slotName: 'ak'
	},
	{
		title: '渠道sk',
		dataIndex: 'sk',
		slotName: 'sk'
	},
	{
		title: '扩展信息',
		dataIndex: 'extra',
		slotName: 'extra'
	},
	{
		title: '渠道状态',
		dataIndex: 'status',
		slotName: 'status'
	},

	{
		title: '创建时间',
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
		slotName: 'operations'
	}
]);

const handleGetPlatform = async () => {
	const { data } = await allType();
	platforms.value = data.list;
};

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await allChannel();
		tableData.value = data.list;
	} finally {
		setLoading(false);
	}
};

handleGet();
handleGetPlatform();

// 处理新增
const handleAdd = async (data: Channel) => {
	await addChannel(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: Channel) => {
	await updateChannel(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteChannel(id);
	handleGet();
	Message.success('删除成功');
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as Channel;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Channel) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = {} as Channel;
	formRef.value.showAddDrawer();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerChannel'
};
</script>
