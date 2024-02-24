<template>
	<a-row v-permission="'uc:app:interface:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="8">
						<a-form-item field="keyword" label="应用标识">
							<a-select
								v-model="form.keyword"
								placeholder="请选择服务"
								:scrollbar="true"
								:options="servers"
								:field-names="{ value: 'id', label: 'name' }"
								@search="search"
								@change="change"
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
import { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
import { onMounted, ref } from 'vue';
import { pageApp } from '@/api/user-center/app';
import { PageAppReq } from '@/api/user-center/types/app';

const emit = defineEmits(['search', 'select']);
const form = ref<PageAppReq>({} as PageAppReq);
const servers = ref<SelectOptionData[]>([]);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value.keyword = undefined;
};

const search = async (val?: string) => {
	const { data } = await pageApp({ page: 1, page_size: 10, keyword: val });
	const { list } = data;
	if (!list) {
		return;
	}

	// 初始化
	const searchd: SelectOptionData[] = [];
	list.forEach((item) => {
		if (form.value.keyword !== item.keyword) {
			item.name = `${item.name}(${item.keyword})`;
			searchd.push(item);
		}
	});

	const selectd: SelectOptionData[] = [];
	servers.value.forEach((item) => {
		if (item.keyword === form.value.keyword) {
			selectd.push(item);
		}
	});

	servers.value = searchd.concat(selectd);
};

const change = (val: any) => {
	emit('select', val);
};

onMounted(() => {
	search();
});
</script>
