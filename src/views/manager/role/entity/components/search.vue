<template>
	<a-row v-permission="'manager:role:entity:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="10">
						<a-form-item field="appId" label="所属应用">
							<a-select
								v-model="form.appId"
								placeholder="请选择应用"
								:scrollbar="true"
								:options="apps"
								allow-search
								@change="handleSelectApp"
								@search="searchAppFactory.Search"
								@dropdown-reach-bottom="searchAppFactory.NextSearch"
							></a-select>
						</a-form-item>
					</a-col>
					<a-col :span="10" v-if="form.appId">
						<a-form-item field="entityId" label="所属实体">
							<a-select
								v-model="form.entityId"
								placeholder="请选择实体"
								:scrollbar="true"
								:options="entities"
								allow-search
								allow-clear
								@search="searchEntityFactory.Search"
								@dropdown-reach-bottom="searchEntityFactory.NextSearch"
							></a-select>
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
import { ListCurrentApp } from '@/api/manager/app/api';
import { ListEntity } from '@/api/manager/entity/api';
import { Entity } from '@/api/manager/entity/type';
import { ListRoleEntityRequest } from '@/api/manager/role/type';
import { Result, Search } from '@/utils/search';

const form = ref<ListRoleEntityRequest>({} as ListRoleEntityRequest);
const emit = defineEmits(['search']);
const entities = ref<Result[]>([]);
const apps = ref<Result[]>([]);

const searchAppFactory = new Search(
	apps.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListCurrentApp({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.appId === (val as number);
	}
);

const searchEntityFactory = new Search(
	entities.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListEntity({ ...req, appId: form.value.appId, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: `${item.name}(${item.comment})`, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.entityId === (val as number);
	}
);

const handleSelectApp = (appId: number) => {
	searchEntityFactory.Search();
};

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as ListRoleEntityRequest;
};

onMounted(() => {
	searchAppFactory.Search();
});
</script>
