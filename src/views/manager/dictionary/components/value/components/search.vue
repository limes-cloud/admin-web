<template>
	<a-row v-permission="'manager:dictionary:value:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="8">
						<a-form-item field="value" label="标识">
							<a-input v-model="form.value" allow-clear placeholder="请输入标识" />
						</a-form-item>
					</a-col>

					<a-col :span="8">
						<a-form-item field="label" label="标签">
							<a-input v-model="form.label" allow-clear placeholder="请输入标签" />
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

const form = ref<{ label?: string; value?: string }>({});
const emit = defineEmits(['search']);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {};
};
</script>
