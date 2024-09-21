<template>
	<a-row v-permission="'application:user:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="6">
						<a-form-item field="name" label="所属应用">
							<a-select
								v-model="form.appId"
								allow-search
								allow-clear
								placeholder="请选择服务"
								:scrollbar="true"
								:options="apps"
								@search="searchFieldFactory.Search"
								@dropdown-reach-bottom="searchFieldFactory.NextSearch"
							></a-select>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="realName" label="用户姓名">
							<a-input v-model="form.realName" allow-clear placeholder="请输入用户姓名" />
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="username" label="用户账户">
							<a-input v-model="form.username" allow-clear placeholder="请输入用户账户" />
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item
							field="phone"
							label="用户电话"
							:validate-trigger="['change', 'input']"
							:rules="[
								{
									validator: phoneValidate
								}
							]"
						>
							<a-input v-model="form.phone" allow-clear placeholder="请输入用户电话" />
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item
							field="email"
							label="用户邮箱"
							:validate-trigger="['change', 'input']"
							:rules="[
								{
									type: 'email',
									required: false,
									message: '邮箱地址不正确'
								}
							]"
						>
							<a-input v-model="form.email" allow-clear placeholder="请输入用户邮箱" />
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="from" label="用户来源">
							<a-input v-model="form.from" allow-clear placeholder="请输入用户来源" />
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="status" label="用户状态">
							<a-select v-model="form.status" allow-search allow-clear placeholder="应用状态">
								<a-option :value="true">启用</a-option>
								<a-option :value="false">禁用</a-option>
							</a-select>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="createdTime" label="创建时间">
							<a-range-picker v-model="form.createdAts" value-format="timestamp" style="width: 100%" allow-clear />
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-col>
		<a-divider style="height: 84px" direction="vertical" />
		<a-col :flex="'86px'" style="text-align: right">
			<a-space direction="vertical" :size="18">
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
import { Search, Result } from '@/utils/search';
import { ListApp } from '@/api/application/app/api';
import { ListUserRequest } from '@/api/application/user/type';
import test from '@/utils/test';

const formRef = ref();
const form = ref<ListUserRequest>({} as ListUserRequest);
const emit = defineEmits(['search']);
const apps = ref<Result[]>([]);

const phoneValidate = (value, cb) => {
	if (!value) {
		cb();
		return;
	}
	if (test.mobile(value)) {
		cb();
	} else {
		cb('电话格式不正确');
	}
};

const searchFieldFactory = new Search(
	apps.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListApp({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.appId === val;
	}
);
searchFieldFactory.Search();

const reset = () => {
	form.value = {} as ListUserRequest;
};

const handleSearch = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}

	const params = { ...form.value };
	if (params.createdAts) {
		if (params.createdAts[0]) {
			params.createdAts[0] /= 1000;
		}
		if (params.createdAts[1]) {
			params.createdAts[1] /= 1000;
		}
	}

	emit('search', params);
	return true;
};
</script>
