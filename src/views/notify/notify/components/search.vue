<template>
	<a-row v-permission="'notify:notify:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="6">
						<a-form-item field="group_id" label="通知分组">
							<a-select
								v-model="form.categoryId"
								placeholder="请选择通知分组"
								:scrollbar="true"
								:options="groups"
								allow-clear
								@search="searchFactory.Search"
								@dropdown-reach-bottom="searchFactory.NextSearch"
								@focus="searchFactory.Search()"
							/>
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item field="keyword" label="通知标识">
							<a-input v-model="form.keyword" allow-clear placeholder="请输入通知标识" />
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item field="name" label="通知名称">
							<a-input v-model="form.name" allow-clear placeholder="请输入通知名称" />
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item field="keyword" label="通知优先级">
							<a-select
								v-model="form.priority"
								placeholder="请选择优先级"
								:scrollbar="true"
								:options="[
									{ label: 'P0', value: 0 },
									{ label: 'P1', value: 1 },
									{ label: 'P2', value: 2 },
									{ label: 'P3', value: 3 }
								]"
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
import { ListNotifyCategory } from '@/api/notify/notify/api';
import { ListNotifyRequest } from '@/api/notify/notify/type';
import { Result, Search } from '@/utils/search';
import { ref } from 'vue';

const form = ref<ListNotifyRequest>({} as ListNotifyRequest);
const emit = defineEmits(['search']);
const groups = ref<Result[]>([]);

const searchFactory = new Search(
	groups.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListNotifyCategory({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.categoryId === val;
	}
);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as ListNotifyRequest;
};
</script>
