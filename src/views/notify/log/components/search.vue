<template>
	<a-row v-permission="'manager:user:query'">
		<a-col :flex="1">
			<a-form ref="formRef" :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="6">
						<a-form-item field="keyword" label="发送用户">
							<a-input v-model="form.user" allow-clear placeholder="请输入发送用户" />
						</a-form-item>
					</a-col>

					<a-col :span="6">
						<a-form-item field="notifyId" label="通知消息">
							<a-select
								v-model="form.notifyId"
								placeholder="请选择通知消息"
								:scrollbar="true"
								:options="notifies"
								@search="searchNotifyFactory.Search"
								@dropdown-reach-bottom="searchNotifyFactory.NextSearch"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="notifyId" label="通知渠道">
							<a-select
								v-model="form.channelId"
								placeholder="请选择通知渠道"
								:scrollbar="true"
								:options="channels"
								@search="searchChannelFactory.Search"
								@dropdown-reach-bottom="searchChannelFactory.NextSearch"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item field="status" label="发送状态">
							<a-select v-model="form.status" allow-search allow-clear placeholder="发送状态">
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
import { ref } from 'vue';
import { ListLogRequest } from '@/api/notify/log/type';
import { Result, Search } from '@/utils/search';
import { ListNotify } from '@/api/notify/notify/api';
import { ListChannel } from '@/api/notify/channel/api';

const formRef = ref();
const form = ref({} as ListLogRequest);
const emit = defineEmits(['search']);

const notifies = ref<Result[]>([]);
const channels = ref<Result[]>([]);

const searchNotifyFactory = new Search(
	notifies.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListNotify({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.notifyId === val;
	}
);

const searchChannelFactory = new Search(
	channels.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListChannel({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.channelId === val;
	}
);

searchNotifyFactory.Search();
searchChannelFactory.Search();

const reset = () => {
	form.value = {} as ListLogRequest;
};

const handleSearch = async () => {
	emit('search', form.value);
	return true;
};
</script>
