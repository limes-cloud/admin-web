<template>
	<a-row v-permission="'uc:user:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="8">
						<a-form-item field="name" label="所属应用">
							<a-select
								v-model="form.app"
								allow-search
								allow-clear
								placeholder="请选择服务"
								:scrollbar="true"
								:options="servers"
								:field-names="{ value: 'keyword', label: 'fullName' }"
								@search="searchApp"
							></a-select>
						</a-form-item>
					</a-col>
					<a-col :span="8">
						<a-form-item field="name" label="用户姓名">
							<a-input v-model="form.real_name" allow-clear placeholder="请输入用户姓名" />
						</a-form-item>
					</a-col>
					<a-col :span="8">
						<a-form-item field="username" label="用户账户">
							<a-input v-model="form.username" allow-clear placeholder="请输入用户账户" />
						</a-form-item>
					</a-col>

					<a-col :span="8">
						<a-form-item field="phone" label="用户电话">
							<a-input v-model="form.phone" allow-clear placeholder="请输入用户电话" />
						</a-form-item>
					</a-col>

					<a-col :span="8">
						<a-form-item field="email" label="用户邮箱">
							<a-input v-model="form.email" allow-clear placeholder="请输入用户邮箱" />
						</a-form-item>
					</a-col>
					<a-col :span="8">
						<a-form-item field="id_card" label="身份证号">
							<a-input v-model="form.id_card" allow-clear placeholder="请输入身份证号" />
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
import { pageServer } from '@/api/configure/server';
import { Server } from '@/api/configure/types/server';
import { PageUserReq } from '@/api/user-center/types/user';
import { ref } from 'vue';

const form = ref<PageUserReq>({} as PageUserReq);
const emit = defineEmits(['search']);
const servers = ref<Server[]>([]);

const handleSearch = () => {
	emit('search', form.value);
};

const searchApp = async (val?: string) => {
	const { data } = await pageServer({ page: 1, page_size: 10, keyword: val });
	const { list } = data;
	if (!list) {
		return;
	}

	// 初始化
	const searchd: Server[] = [];
	list.forEach((item) => {
		if (form.value.app !== item.keyword) {
			item.fullName = `${item.name}(${item.keyword})`;
			searchd.push(item);
		}
	});

	const selectd: Server[] = [];
	servers.value.forEach((item) => {
		if (item.keyword === form.value.app) {
			selectd.push(item);
		}
	});

	servers.value = searchd.concat(selectd);
};

const reset = () => {
	form.value = {} as PageUserReq;
};
</script>
