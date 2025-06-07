<template>
	<a-row v-permission="'ai-agent:tool:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="6">
						<a-form-item field="title" label="工具标题">
							<a-input v-model="form.title" allow-clear placeholder="请输入工具标题" />
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item field="type" label="工具类型">
							<a-select v-model="form.type" :options="GTypes.toolTypes" allow-clear placeholder="请选择工具类型"></a-select>
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item field="isOpen" label="工具状态">
							<a-select v-model="form.isOpen" allow-clear placeholder="请选择工具状态">
								<a-option label="公开" :value="true"></a-option>
								<a-option label="私有" :value="true"></a-option>
							</a-select>
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item field="title" label="工具标题">
							<a-input v-model="form.title" allow-clear placeholder="请输入工具标题" />
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
import { ref } from 'vue';
import { ListToolRequest } from '@/api/ai-agent/tool/type';
import GTypes from './types';

const form = ref<ListToolRequest>({} as ListToolRequest);
const emit = defineEmits(['search']);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as ListToolRequest;
};
</script>
