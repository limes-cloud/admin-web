<template>
	<Popup v-model:visible="visible" unmount-on-close :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="type"
				label="渠道类型"
				:rules="[
					{
						required: true,
						message: '渠道类型是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.type"
					placeholder="请选择渠道类型"
					:scrollbar="true"
					:options="types"
					:field-names="{ value: 'keyword', label: 'name' }"
					@change="handleSelectType"
				></a-select>
			</a-form-item>

			<a-form-item
				field="name"
				label="渠道名称"
				:rules="[
					{
						required: true,
						message: '渠道名称是必填项'
					}
				]"
			>
				<a-input v-model="form.name" placeholder="请输入渠道名称" allow-clear />
			</a-form-item>

			<template v-if="form.type === 'email'">
				<a-form-item
					field="ak"
					label="邮箱账户"
					:rules="[
						{
							required: true,
							message: '邮箱账户是必填项'
						}
					]"
				>
					<a-input v-model="form.ak" placeholder="请输入邮箱账户" allow-clear />
				</a-form-item>
				<a-form-item
					field="sk"
					label="邮箱密码"
					:rules="[
						{
							required: true,
							message: '邮箱密码是必填项'
						}
					]"
				>
					<a-input v-model="form.sk" placeholder="请输入邮箱密码" allow-clear />
				</a-form-item>
				<a-form-item
					field="extraObject.name"
					label="邮箱名称"
					:rules="[
						{
							required: true,
							message: '邮箱名称是必填项'
						}
					]"
				>
					<a-input v-model="form.extraObject.name" placeholder="请输入邮箱名称" allow-clear />
				</a-form-item>
				<a-form-item
					field="extraObject.host"
					label="邮箱host"
					:rules="[
						{
							required: true,
							message: '邮箱host是必填项'
						}
					]"
				>
					<a-input v-model="form.extraObject.host" placeholder="请输入邮箱host" allow-clear />
				</a-form-item>
				<a-form-item
					field="extraObject.port"
					label="邮箱port"
					:rules="[
						{
							required: true,
							message: '邮箱port是必填项'
						}
					]"
				>
					<a-input-number v-model="form.extraObject.port" placeholder="请输入邮箱port" allow-clear />
				</a-form-item>
			</template>

			<template v-if="form.type === 'official_account'">
				<a-form-item
					field="ak"
					label="APPID"
					:rules="[
						{
							required: true,
							message: 'APPID是必填项'
						}
					]"
				>
					<a-input v-model="form.ak" placeholder="请输入APPID" allow-clear />
				</a-form-item>
				<a-form-item
					field="sk"
					label="APPSK"
					:rules="[
						{
							required: true,
							message: 'APPSK是必填项'
						}
					]"
				>
					<a-input v-model="form.sk" placeholder="请输入APPSK" allow-clear />
				</a-form-item>
			</template>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Channel, ChannelType, CreateChannelRequest, UpdateChannelRequest } from '@/api/notify/channel/type';
import { CreateChannel, ListChannelType, UpdateChannel } from '@/api/notify/channel/api';
import { Message } from '@arco-design/web-vue';

const types = ref<ChannelType[]>([]);
const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Channel;
}>();

type Type = CreateChannelRequest | UpdateChannelRequest;
const form = ref<Type>({ ...props.data, extraObject: {} as any });
const emit = defineEmits(['refresh']);

watch(
	() => props.data,
	(val) => {
		form.value = { ...val, extraObject: {} as any };
		form.value.extraObject = JSON.parse(val.extra || '{}');
	}
);

const handleGetTypes = async () => {
	const { data } = await ListChannelType();
	types.value = data.list;
};

handleGetTypes();

const showAddDrawer = () => {
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = () => {
	visible.value = true;
	isAdd.value = false;
};

const closeDrawer = () => {
	visible.value = false;
};

const handleSelectType = () => {
	types.value.forEach((item) => {
		if (item.keyword === form.value.type) {
			form.value.name = `${item.name}-`;
		}
	});
};

defineExpose({ showAddDrawer, showUpdateDrawer, closeDrawer });

const handleSubmit = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}
	const data = { ...form.value };
	data.extra = JSON.stringify(data.extraObject);
	data.extraObject = {} as any;
	if (isAdd.value) {
		await CreateChannel(data as CreateChannelRequest);
		Message.success('创建成功');
	} else {
		await UpdateChannel(data as UpdateChannelRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
