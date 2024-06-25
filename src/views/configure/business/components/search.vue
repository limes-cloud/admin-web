<template>
	<a-row v-permission="'configure:business:query'">
		<a-col :flex="1">
			<a-form ref="formRef" :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="6">
						<a-form-item field="serverId" label="所属服务">
							<a-select
								v-model="form.serverId"
								placeholder="请选择服务"
								:scrollbar="true"
								:options="servers"
								@search="searchFieldFactory.Search"
								@dropdown-reach-bottom="searchFieldFactory.NextSearch"
								@change="selectServer"
							></a-select>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="keyword" label="变量标识">
							<a-input v-model="form.keyword" allow-clear placeholder="请输入变量标识" />
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-col>
		<a-col :flex="'86px'" style="text-align: right">
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
import { ListBusinessRequest } from '@/api/configure/business/type';
import { Search, Result } from '@/utils/search';
import { ListServer } from '@/api/configure/server/api';

const emit = defineEmits(['search', 'select']);
const formRef = ref();
const form = ref<ListBusinessRequest>({} as ListBusinessRequest);
const servers = ref<Result[]>([]);

const searchFieldFactory = new Search(
	servers.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListServer({ ...req, status: true, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.serverId === val;
	}
);
searchFieldFactory.Search();

const reset = () => {
	form.value.keyword = undefined;
};

const selectServer = (val: any) => {
	emit('select', val);
};

const handleSearch = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}

	emit('search', form.value);
	return true;
};
</script>
