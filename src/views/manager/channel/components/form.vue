<template>
	<Popup v-model:visible="visible" unmount-on-close :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="logo"
				label="渠道图标"
				:rules="[
					{
						required: true,
						message: '渠道图标是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<Upload
					ref="upload"
					:size="100"
					:limit="1"
					:file-size="1000"
					:draggable="true"
					:multiple="false"
					:auto-upload="true"
					:files="files()"
					directory-path="manager/channel/logo"
					accept="image/*"
					@change="handleUploadImage"
				></Upload>
			</a-form-item>

			<a-form-item
				field="keyword"
				label="渠道标识"
				:rules="[
					{
						required: true,
						message: '渠道标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" placeholder="请输入渠道标识" allow-clear />
			</a-form-item>

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
				field="admin"
				label="后台授权"
				:rules="[
					{
						required: true,
						message: '后台授权是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.admin"
					placeholder="请选是否开启后台授权"
					:options="[
						{ label: '开启', value: true },
						{ label: '关闭', value: false }
					]"
				></a-select>
			</a-form-item>

			<a-form-item
				field="ak"
				label="渠道AK"
				:rules="[
					{
						required: true,
						message: '渠道AK是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.ak" placeholder="请输入渠道AK" allow-clear />
			</a-form-item>

			<a-form-item
				field="sk"
				label="渠道SK"
				:rules="[
					{
						required: true,
						message: '渠道SK是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.sk" placeholder="请输入渠道SK" allow-clear />
			</a-form-item>

			<a-form-item
				field="description"
				label="渠道备注"
				:rules="[
					{
						required: true,
						message: '渠道SK是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" placeholder="请输入渠道备注" allow-clear />
			</a-form-item>

			<a-form-item field="extra" label="扩展信息">
				<CodeEditor
					v-model="form.extra"
					:style="{ width: '100%', height: '150px' }"
					:show-folding="false"
					:show-line="false"
					:show-fullscreen="true"
				></CodeEditor>
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { FileItem } from '@arco-design/web-vue/es/upload/interfaces';
import { ref, watch, getCurrentInstance } from 'vue';
import { Message } from '@arco-design/web-vue';
import { Channel, ChannelType, CreateChannelRequest, UpdateChannelRequest } from '@/api/manager/channel/type';
import { CreateChannel, ListChannelType, UpdateChannel } from '@/api/manager/channel/api';

const types = ref<ChannelType[]>([]);
const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const { proxy } = getCurrentInstance() as any;

const props = defineProps<{
	data: Channel;
}>();

type Type = CreateChannelRequest | UpdateChannelRequest;
const form = ref<Type>({ ...props.data });
const emit = defineEmits(['refresh']);

watch(
	() => props.data,
	(val) => {
		form.value = val;
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
		if (item.keyword === form.value.keyword) {
			form.value.name = item.name;
		}
	});
};

defineExpose({ showAddDrawer, showUpdateDrawer, closeDrawer });

const files = () => {
	if (props.data.logo) {
		return [
			{
				url: proxy.$rurl(props.data.logoUrl, 100, 100),
				sha: props.data.logo
			}
		];
	}
	return [];
};

const handleUploadImage = (fs: FileItem[]) => {
	if (!fs || !fs.length) return;
	const file = fs[0];
	form.value.logo = file.response.sha;
};

const handleSubmit = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}
	const data = form.value;
	try {
		if (isAdd.value) {
			await CreateChannel(data as CreateChannelRequest);
			Message.success('创建成功');
		} else {
			await UpdateChannel(data as UpdateChannelRequest);
			Message.success('更新成功');
		}
		emit('refresh');
		return true;
	} catch (e) {
		return false;
	}
};
</script>
