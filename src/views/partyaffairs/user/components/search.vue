<template>
	<a-row v-permission="'manager:user:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="8">
						<a-form-item field="name" label="用户姓名">
							<a-input v-model="form.name" allow-clear placeholder="请输入用户姓名" />
						</a-form-item>
					</a-col>

					<a-col :span="8">
						<a-form-item field="phone" label="电话/邮箱">
							<a-input v-model="form.username" allow-clear placeholder="请输入用户电话/邮箱" />
						</a-form-item>
					</a-col>

					<a-col :span="8">
						<a-form-item field="status" label="用户状态">
							<a-select v-model="form.status" allow-search allow-clear placeholder="用户状态">
								<a-option :value="true">启用</a-option>
								<a-option :value="false">禁用</a-option>
							</a-select>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-col>

		<!-- <a-divider style="height: 34px" direction="vertical" /> -->
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
import { PageUserReq } from '@/api/partyaffairs/types/user';
import { ref } from 'vue';

const form = ref<PageUserReq>({} as PageUserReq);
const emit = defineEmits(['search']);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as PageUserReq;
};
</script>
