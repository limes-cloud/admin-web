<template>
	<a-row v-permission="'configure:resource:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="8">
						<a-form-item field="keyword" label="变量标识">
							<a-input v-model="form.keyword" allow-clear placeholder="请输入变量标识" />
						</a-form-item>
					</a-col>
					<a-col :span="8">
						<a-form-item field="tag" label="变量标签">
							<a-input v-model="form.tag" allow-clear placeholder="请输入变量标签" />
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
import { PageResourceReq } from '@/api/configure/types/resource';
import { ref } from 'vue';

const form = ref<PageResourceReq>({} as PageResourceReq);
const emit = defineEmits(['search']);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as PageResourceReq;
};
</script>
