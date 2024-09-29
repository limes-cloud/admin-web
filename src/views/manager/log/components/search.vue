<template>
	<a-row v-permission="'manager:login:log:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="6">
						<a-form-item field="name" label="登陆账户">
							<a-input v-model="form.username" allow-clear placeholder="请输入登陆账户" />
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="createdTime" label="登陆时间">
							<a-range-picker v-model="form.createdAts" value-format="timestamp" style="width: 100%" allow-clear />
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
import { ListLoginLogRequest } from '@/api/manager/user/type';
import { ref } from 'vue';

const form = ref({} as ListLoginLogRequest);
const emit = defineEmits(['search']);

const handleSearch = () => {
	const params = { ...form.value };
	if (params.createdAts) {
		if (params.createdAts[0]) {
			params.createdAts[0] /= 1000;
		}
		if (params.createdAts[1]) {
			params.createdAts[1] /= 1000;
		}
	}
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as ListLoginLogRequest;
};
</script>
