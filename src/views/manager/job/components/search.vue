<template>
	<a-row>
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="6">
						<a-form-item field="name" label="职位标识">
							<a-input v-model="form.keyword" allow-clear placeholder="请输入职位名称" />
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="name" label="职位名称">
							<a-input v-model="form.name" allow-clear placeholder="请输入职位名称" />
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
import { ListJobRequest } from '@/api/manager/job/type';
import { ref } from 'vue';

const form = ref<ListJobRequest>({});
const emit = defineEmits(['search']);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {};
};
</script>
