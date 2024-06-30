<template>
	<a-row v-permission="'cron:worker:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="8">
						<a-form-item field="groupId" label="节点分组">
							<a-select
								v-model="form.groupId"
								placeholder="请选择节点分组"
								:scrollbar="true"
								:options="groups"
								allow-clear
								@search="searchFactory.Search"
								@dropdown-reach-bottom="searchFactory.NextSearch"
								@focus="searchFactory.Search()"
							/>
						</a-form-item>
					</a-col>

					<a-col :span="8">
						<a-form-item field="name" label="节点名称">
							<a-input v-model="form.name" allow-clear placeholder="请输入节点名称" />
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
import { ListWorkerGroup } from '@/api/cron/worker/api';
import { ListWorkerRequest } from '@/api/cron/worker/type';
import { Result, Search } from '@/utils/search';
import { ref } from 'vue';

const groups = ref<Result[]>([]);
const form = ref<ListWorkerRequest>({} as ListWorkerRequest);
const emit = defineEmits(['search']);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as ListWorkerRequest;
};

const searchFactory = new Search(
	groups.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListWorkerGroup({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.groupId === val;
	}
);
</script>
