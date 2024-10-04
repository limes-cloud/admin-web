<template>
	<a-row v-permission="'partyaffairs:resource:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="6">
						<a-form-item field="name" label="资料分类">
							<a-select
								v-model="form.classifyId"
								placeholder="请选择资料分类"
								:scrollbar="true"
								:options="classifies"
								:field-names="{ value: 'id', label: 'name' }"
							></a-select>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="name" label="资料标题">
							<a-input v-model="form.title" allow-clear placeholder="请输入资料标题" />
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
import { ResourceClassify, ListResourceRequest } from '@/api/partyaffairs/resource/type';
import { ref } from 'vue';

const form = ref<ListResourceRequest>({} as ListResourceRequest);
const emit = defineEmits(['search']);
defineProps<{
	classifies: ResourceClassify[];
}>();
const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as ListResourceRequest;
};
</script>
