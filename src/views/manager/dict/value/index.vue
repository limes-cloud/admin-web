<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<Search @search="handleSearch"></Search>
			<Tool
				v-model:size="size"
				v-model:columns="columns"
				:type="dict.type"
				@reload-value="getReloadValues"
				@refresh="handleGet"
				@add="handleToolAdd"
			></Tool>
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
				@add="handleTableAdd"
				@update="handleTableUpdate"
				@delete="handleDelete"
			></Table>
			<Form ref="formRef" :data="form" @add="handleAdd" @update="handleUpdate"></Form>
		</a-card>

		<a-modal
			v-model:visible="reloadVisible"
			title="变更详情"
			width="600px"
			unmount-on-close
			:body-style="{ height: '400px', padding: '0' }"
			@cancel="reloadVisible = false"
			@before-ok="handleReloadValue"
		>
			<a-table
				:columns="reloadValuecolumns"
				:pagination="false"
				:data="reloadValues"
				:bordered="false"
				:scroll="{
					x: '100%',
					y: '400px'
				}"
			>
				<template #type="{ record }">
					<a-tag v-if="record.type === 'add'" color="arcoblue">增加字段</a-tag>
					<a-tag v-if="record.type === 'del'" color="red">删除字段</a-tag>
					<a-tag v-if="record.type === 'update'" color="orange">修改字段</a-tag>
				</template>
				<template #old="{ record }">
					<a-textarea readonly :model-value="record.old"></a-textarea>
				</template>
				<template #cur="{ record }">
					<a-textarea readonly :model-value="record.cur"></a-textarea>
				</template>
			</a-table>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { Pagination, TableCloumn, TableSize } from '@/types/global';
import useLoading from '@/hooks/loading';
import { Message } from '@arco-design/web-vue';

import { pageDictValue, addDictValue, deleteDictValue, updateDictValue, loadDictValue, importDictValue } from '@/api/manager/dict-value';
import { PageDictValueReq, DictValue, ImportDictValueData } from '@/api/manager/types/dict-value';
import router from '@/router';
import { getDict } from '@/api/manager/dict';
import { Dict } from '@/api/manager/types/dict';
import Tool from './components/tool.vue';
import Table from './components/table.vue';
import Form from './components/form.vue';
import Search from './components/search.vue';

const params = router.currentRoute.value.query;
const formRef = ref();
const form = ref<DictValue>({} as DictValue);
const { setLoading } = useLoading(true);
const loading = ref(false);
const tableData = ref<TableData[]>();
const size = ref<TableSize>('medium');
const total = ref(0);
const searchForm = ref<PageDictValueReq>({
	page: 1,
	page_size: 10,
	dict_id: params.dict_id as unknown as number
});
const dict = ref<Dict>({ type: '' } as Dict);
const reloadVisible = ref(false);
const reloadValues = ref<ImportDictValueData[]>([]);

const reloadValuecolumns = ref<TableCloumn[]>([
	{
		title: '标签',
		dataIndex: 'label'
	},
	{
		title: '值',
		dataIndex: 'value'
	},
	{
		title: '描述',
		dataIndex: 'description'
	}
]);

const columns = ref<TableCloumn[]>([
	{
		title: '标签',
		dataIndex: 'label'
	},
	{
		title: '值',
		dataIndex: 'value'
	},
	{
		title: '状态',
		slotName: 'status'
	},
	{
		title: '权重',
		dataIndex: 'weight'
	},
	{
		title: '扩展信息',
		dataIndex: 'extra'
	},
	{
		title: '描述',
		dataIndex: 'description'
	},
	{
		title: '创建时间',
		dataIndex: 'created_at',
		slotName: 'createdAt',
		width: 170
	},
	{
		title: '更新时间',
		dataIndex: 'updated_at',
		slotName: 'updatedAt',
		width: 170
	},
	{
		title: '操作',
		dataIndex: 'operations',
		slotName: 'operations',
		fixed: 'right',
		width: 200
	}
]);

// handleGet 处理查询
const handleGet = async () => {
	setLoading(true);
	try {
		const { data } = await pageDictValue(searchForm.value);
		tableData.value = data.list as unknown as TableData[];
		total.value = data.total;
	} finally {
		setLoading(false);
	}
};

// handleGet 处理查询
const handleGetDict = async () => {
	const { data } = await getDict(searchForm.value.dict_id);
	dict.value = data;
};

handleGet();
handleGetDict();

// 处理查询
const handleSearch = async (req: PageDictValueReq) => {
	const pageSize = searchForm.value.page_size;
	searchForm.value = {
		...req,
		page: 1,
		page_size: pageSize
	};

	handleGet();
};

// 处理页面变更
const handlePageChange = async (page: Pagination) => {
	searchForm.value.page = page.current;
	searchForm.value.page_size = page.pageSize;
	handleGet();
};

// 处理新增
const handleAdd = async (data: DictValue) => {
	data.dict_id = params.dict_id as unknown as number;
	await addDictValue(data);
	handleGet();
	Message.success('创建成功');
};

// 处理修改
const handleUpdate = async (data: DictValue) => {
	await updateDictValue(data);
	handleGet();
	Message.success('更新成功');
};

// 处理数据删除
const handleDelete = async (id: number) => {
	await deleteDictValue(id);
	handleGet();
	Message.success('删除成功');
};

//  处理tool按钮新建
const handleToolAdd = () => {
	form.value = {} as DictValue;
	formRef.value.showAddDrawer();
};

// 处理table点击更新
const handleTableUpdate = async (data: DictValue) => {
	form.value = { ...data };
	formRef.value.showUpdateDrawer();
};

// 处理table点击添加
const handleTableAdd = (id: number) => {
	form.value = { id } as DictValue;
	formRef.value.showAddDrawer();
};

const extractValues = (data: any, expression: string) => {
	// 定义一个递归函数来处理嵌套的对象和数组
	function recursiveExtract(obj: any, path: string[]): any[] {
		return Object.keys(obj).reduce((acc: any, key: string) => {
			const value = obj[key];
			const newPath = path.concat(key);

			if (Array.isArray(value)) {
				return acc.concat(value.map((item) => recursiveExtract(item, newPath)));
			}
			if (typeof value === 'object' && value !== null) {
				return acc.concat(recursiveExtract(value, newPath));
			}
			const finalPath = newPath.join('.');
			if (finalPath === expression) {
				return acc.concat({ [key]: value });
			}
			return acc;
		}, []);
	}

	if (Array.isArray(data)) {
		const result: any[][] = [];
		data.forEach((item) => {
			const rs = extractValues(item, expression);
			result.push(...rs);
		});
		return result;
	}
	return recursiveExtract(data, []);

	// 调用递归函数并返回结果
};

// getReloadValues 处理重新载入字典数据
const getReloadValues = async () => {
	const req = JSON.parse(dict.value.extra);
	req.params = JSON.parse(req.params);
	const { data } = await loadDictValue(req);

	// 提取label
	const labels = extractValues(data, req.label);
	// 提取value
	const values = extractValues(data, req.value);
	// 提取value
	const descriptions = extractValues(data, req.description);

	// 组成新的数组
	const dvs: ImportDictValueData[] = [];
	const len = labels.length;
	for (let i = 0; i < len; i += 1) {
		dvs.push({
			label: labels[i][req.label],
			value: values[i][req.value],
			description: descriptions[i][req.description]
		});
	}

	// 弹框提示
	reloadValues.value = dvs;
	reloadVisible.value = true;
};

const handleReloadValue = async () => {
	const { data } = await importDictValue({ dict_id: searchForm.value.dict_id, list: reloadValues.value });
	Message.success(`成功同步字典值${data.count}行`);
	handleGet();
};
</script>

<script lang="ts">
export default {
	name: 'ManagerDictValue'
};
</script>
