<template>
	<a-row v-permission="'partyaffairs:public:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="6">
						<a-form-item field="name" label="公开分类">
							<a-select
								v-model="form.classifyId"
								placeholder="请选择公开分类"
								:scrollbar="true"
								:options="classifies"
								:field-names="{ value: 'id', label: 'name' }"
							></a-select>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="name" label="公开标题">
							<a-input v-model="form.title" allow-clear placeholder="请输入公开标题" />
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="status" label="公开状态">
							<a-select v-model="form.status" allow-search allow-clear placeholder="请选择公开状态">
								<a-option :value="true">启用</a-option>
								<a-option :value="false">禁用</a-option>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="isTop" label="是否置顶">
							<a-select v-model="form.isTop" allow-search allow-clear placeholder="请选择公开状态">
								<a-option :value="true">是</a-option>
								<a-option :value="false">否</a-option>
							</a-select>
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
import { PublicClassify, ListPublicRequest } from '@/api/partyaffairs/public/type';
import { ref } from 'vue';

const form = ref<ListPublicRequest>({} as ListPublicRequest);
const emit = defineEmits(['search']);
defineProps<{
	classifies: PublicClassify[];
}>();
const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as ListPublicRequest;
};
</script>
