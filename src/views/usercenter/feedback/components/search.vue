<template>
	<a-row v-permission="'uc:feedback:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="6">
						<a-form-item field="groupId" label="反馈分类">
							<a-select
								v-model="form.categoryId"
								placeholder="请选择反馈分类"
								:scrollbar="true"
								:options="categories"
								allow-clear
								@search="searchFactory.Search"
								@dropdown-reach-bottom="searchFactory.NextSearch"
								@focus="searchFactory.Search()"
							/>
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item field="appId" label="所属应用">
							<a-select
								v-model="form.appId"
								placeholder="请选择所属应用"
								:scrollbar="true"
								:options="apps"
								allow-clear
								@search="searchAppFactory.Search"
								@dropdown-reach-bottom="searchAppFactory.NextSearch"
								@focus="searchAppFactory.Search()"
							/>
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item field="status" label="处理状态">
							<a-select
								v-model="form.status"
								placeholder="请选择处理状态"
								:scrollbar="true"
								:options="statusList"
								allow-clear
								:field-names="{ value: 'type', label: 'label' }"
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
import { ListFeedbackCategory } from '@/api/usercenter/feedback/api';
import { ListFeedbackRequest } from '@/api/usercenter/feedback/type';
import { Result, Search } from '@/utils/search';
import { ref } from 'vue';
import { ListApp } from '@/api/usercenter/app/api';
import statusList from './status';

const apps = ref<Result[]>([]);
const categories = ref<Result[]>([]);
const form = ref<ListFeedbackRequest>({} as ListFeedbackRequest);
const emit = defineEmits(['search']);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as ListFeedbackRequest;
};

const searchFactory = new Search(
	categories.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListFeedbackCategory({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.categoryId === val;
	}
);

const searchAppFactory = new Search(
	apps.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListApp({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.appId === val;
	}
);
</script>
