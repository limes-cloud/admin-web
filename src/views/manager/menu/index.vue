<template>
	<div class="container">
		<Breadcrumb />
		<div class="general-card">
			<Tool v-model:size="size" v-model:columns="columns" @refresh="handleGet" @add="handleToolAdd"></Tool>
			<Table
				class="general-table"
				:columns="columns"
				:loading="loading"
				:data="tableData"
				:size="size"
				@add="handleTableAdd"
				@update="handleTableUpdate"
				@refresh="handleGet"
			></Table>
			<Form ref="formRef" :menus="tableData" :app-id="appId" @refresh="handleGet"></Form>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useLoading from '@/hooks/loading';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { TableColumn, TableSize } from '@/types/global';
import { Menu } from '@/api/manager/menu/type';
import { ListMenu } from '@/api/manager/menu/api';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';

const router = useRouter();
const appId = ref(0);
const formRef = ref();
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const columns = ref<TableColumn[]>([
	{
		title: '菜单标题',
		slotName: 'title'
	},
	{
		title: '菜单路由',
		dataIndex: 'path'
	},
	{
		title: '菜单类型',
		slotName: 'type'
	},
	{
		title: '是否隐藏',
		slotName: 'isHidden'
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
		dataIndex: 'operations',
		slotName: 'operations'
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await ListMenu({ appId: appId.value });
		tableData.value = data.list;
	} finally {
		setLoading(false);
	}
};

//  处理tool按钮新建
const handleToolAdd = () => {
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = (data: Menu) => {
	formRef.value.showUpdateDrawer(data);
};

const handleTableAdd = (data: Menu) => {
	formRef.value.showAddDrawer({ parentId: data.id });
};

onMounted(() => {
	const aid = router.currentRoute.value.query.appId;
	appId.value = Number(aid) as unknown as number;
	handleGet();
});

// 处理
</script>

<script lang="ts">
export default {
	name: 'ManagerMenu'
};
</script>
