<template>
	<a-row v-permission="'ai-agent:secret:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="6">
						<a-form-item field="group_id" label="密钥分组">
							<a-select
								v-model="form.groupId"
								placeholder="请选择密钥分组"
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
						<a-form-item field="name" label="密钥描述">
							<a-input v-model="form.description" allow-clear placeholder="请输入密钥描述" />
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
import { Result, Search } from '@/utils/search';
import { ref } from 'vue';
import { ListSecretGroup } from '@/api/ai-agent/secret/api';
import { ListSecretRequest } from '@/api/ai-agent/secret/type';

const form = ref<ListSecretRequest>({} as ListSecretRequest);
const emit = defineEmits(['search']);
const groups = ref<Result[]>([]);

const searchFactory = new Search(
	groups.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListSecretGroup({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.groupId === val;
	}
);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as ListSecretRequest;
};
</script>
