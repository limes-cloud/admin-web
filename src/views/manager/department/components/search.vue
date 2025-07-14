<template>
	<a-row>
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="6">
						<a-form-item field="name" label="部门标识">
							<a-input v-model="form.keyword" allow-clear placeholder="请输入部门名称" />
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="name" label="部门名称">
							<a-input v-model="form.name" allow-clear placeholder="请输入部门名称" />
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item
							field="classifyId"
							label="部门分类"
							:rules="[
								{
									required: true,
									message: '部门分类是必填项'
								}
							]"
							:validate-trigger="['change', 'input']"
						>
							<a-select
								v-model="form.classifyId"
								placeholder="请选择部门分类"
								:scrollbar="true"
								:options="classifies"
								@search="search.Search"
								@dropdown-reach-bottom="search.NextSearch"
							/>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-col>
		<a-col :flex="'220px'" style="text-align: right">
			<a-space :size="18">
				<a-button type="primary" @click="handleSearch">
					<template #icon>
						<icon-search />
					</template>
					搜索
				</a-button>
				<a-button @click="reset">
					<template #icon>
						<icon-refresh />
					</template>
					重置
				</a-button>
			</a-space>
		</a-col>
	</a-row>
</template>

<script lang="ts" setup>
import { ListDepartmentClassify } from '@/api/manager/department/api';
import { ListDepartmentRequest } from '@/api/manager/department/type';
import { Result, Search } from '@/utils/search';
import { ref } from 'vue';

const form = ref<ListDepartmentRequest>({});
const emit = defineEmits(['search']);

const classifies = ref<Result[]>([]);

const search = new Search(
	classifies.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListDepartmentClassify({ ...req, name: req.query as string | undefined });

		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return form.value.classifyId === val;
	}
);

search.Search();

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {};
};
</script>
