<template>
	<a-row v-permission="'partyaffairs:news:content:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="8">
						<a-form-item field="classify_id" label="新闻分类">
							<a-select
								v-model="form.classify_id"
								placeholder="请选择新闻分类"
								:scrollbar="true"
								:options="classifys"
								:field-names="{ value: 'id', label: 'name' }"
								allow-clear
							/>
						</a-form-item>
					</a-col>

					<a-col :span="8">
						<a-form-item field="title" label="新闻标题">
							<a-input v-model="form.title" allow-clear placeholder="请输入新闻标题" />
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
import { PageNewsContentReq } from '@/api/partyaffairs/types/news';
import { CascaderOption } from '@arco-design/web-vue/es/cascader/interface';
import { ref } from 'vue';

defineProps<{
	classifys: CascaderOption[];
}>();

const form = ref<PageNewsContentReq>({} as PageNewsContentReq);
const emit = defineEmits(['search']);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as PageNewsContentReq;
};
</script>
