<template>
	<a-row v-permission="'poverty:resource:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="6">
						<a-form-item field="name" label="文件标题">
							<a-input v-model="form.title" allow-clear placeholder="请输入文件标题" />
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="status" label="文件状态">
							<a-select v-model="form.status" allow-search allow-clear placeholder="请选择文件状态">
								<a-option :value="true">启用</a-option>
								<a-option :value="false">禁用</a-option>
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
import { ListResourceRequest } from '@/api/poverty/resource/type';
import { ref } from 'vue';

const form = ref<ListResourceRequest>({} as ListResourceRequest);
const emit = defineEmits(['search']);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as ListResourceRequest;
};
</script>
