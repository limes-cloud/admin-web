<template>
	<Popup v-model:visible="visible" unmount-on-close :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="right" layout="horizontal" auto-label-width>
			<a-form-item
				field="channelId"
				label="授权渠道"
				:rules="[
					{
						required: true,
						message: '授权渠道是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.channelId"
					placeholder="请选择授权渠道"
					:scrollbar="true"
					:options="channels"
					@search="search.Search"
					@dropdown-reach-bottom="search.NextSearch"
				/>
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { CreateAppOAuthChannel } from '@/api/manager/app/api';
import { AppOAuthChannel, CreateAppOAuthChannelRequest } from '@/api/manager/app/type';
import { Result, Search } from '@/utils/search';
import { Message } from '@arco-design/web-vue';
import { ref } from 'vue';
import { ListChannel } from '@/api/manager/channel/api';

const props = defineProps<{ appId: number }>();

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

type Type = CreateAppOAuthChannelRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

const channels = ref<Result[]>([]);

const search = new Search(
	channels.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListChannel({ ...req, name: req.query as string | undefined });

		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return form.value.appId === val;
	}
);

const showAddDrawer = () => {
	search.Search();

	visible.value = true;
	isAdd.value = true;
	form.value = {} as Type;
};

const showUpdateDrawer = (data: AppOAuthChannel) => {
	search.Search();

	if (!search.IsExist(data.appId)) {
		channels.value.push({ label: data.channel.name, value: data.channel.id } as Result);
	}

	form.value = { ...data } as Type;

	visible.value = true;
	isAdd.value = false;
};

const closeDrawer = () => {
	visible.value = false;
};

defineExpose({ showAddDrawer, showUpdateDrawer, closeDrawer });

const handleSubmit = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}
	const data = { ...form.value };
	data.appId = props.appId;

	try {
		await CreateAppOAuthChannel(data as CreateAppOAuthChannelRequest);
		Message.success('创建成功');
		emit('refresh');
		return true;
	} catch (e) {
		return false;
	}
};
</script>

<style lang="less" scoped>
.tree-content {
	width: 100%;
	max-height: 300px;
	overflow: scroll;
	border: 1px solid var(--color-border);
	padding: 12px;
	border-radius: 4px;
	&::-webkit-scrollbar {
		display: none;
	}
}

.empty {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	.empty-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
}
</style>
