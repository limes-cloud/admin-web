<template>
	<Popup v-model:visible="visible" unmount-on-close :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="right" layout="horizontal" auto-label-width>
			<a-form-item
				field="logo"
				label="应用图标"
				:rules="[
					{
						required: true,
						message: '应用图标是必填项'
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
					directory-path="manager/app/logo"
					accept="image/*"
					@change="handleUploadImage"
				></Upload>
			</a-form-item>

			<a-form-item
				field="name"
				label="应用名称"
				:rules="[
					{
						required: true,
						message: '应用名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" placeholder="请输入应用名称" allow-clear />
			</a-form-item>

			<a-form-item
				field="keyword"
				label="应用标志"
				:rules="[
					{
						required: true,
						message: '应用标志是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" placeholder="请输入应用标志" allow-clear />
			</a-form-item>

			<a-form-item
				field="allowRegistry"
				label="允许注册"
				:rules="[
					{
						required: true,
						message: '允许注册是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-radio-group v-model="form.allowRegistry">
					<a-radio :value="true">是</a-radio>
					<a-radio :value="false">否</a-radio>
				</a-radio-group>
			</a-form-item>

			<a-form-item
				field="channelIds"
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
					v-model="form.channelIds"
					placeholder="请选择授权渠道"
					multiple
					:max-tag-count="2"
					:scrollbar="true"
					:options="channels"
					allow-search
					@search="searchChannelFactory.Search"
					@dropdown-reach-bottom="searchChannelFactory.NextSearch"
				></a-select>
			</a-form-item>

			<a-form-item field="fieldIds" label="信息字段">
				<a-select
					v-model="form.fieldIds"
					placeholder="请选择信息字段"
					multiple
					:max-tag-count="2"
					:scrollbar="true"
					:options="fields"
					@search="searchFieldFactory.Search"
					@dropdown-reach-bottom="searchFieldFactory.NextSearch"
				></a-select>
			</a-form-item>

			<a-form-item
				field="version"
				label="应用版本"
				:rules="[
					{
						required: true,
						message: '允许注册是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.version" placeholder="请输入应用版本" allow-clear />
			</a-form-item>

			<a-form-item
				field="copyright"
				label="应用版权"
				:rules="[
					{
						required: true,
						message: '允许注册是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.copyright" placeholder="请输入应用版权" allow-clear />
			</a-form-item>

			<a-form-item field="extra" label="扩展信息">
				<a-textarea v-model="form.extra" placeholder="请输入扩展信息" allow-clear />
			</a-form-item>

			<a-form-item field="description" label="应用描述">
				<a-textarea v-model="form.description" placeholder="请输入应用描述" allow-clear />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { CreateApp, GetApp, UpdateApp } from '@/api/manager/app/api';
import { App, CreateAppRequest, UpdateAppRequest } from '@/api/manager/app/type';
import { Message } from '@arco-design/web-vue';
import { FileItem } from '@arco-design/web-vue/es/upload/interfaces';
import { ref, getCurrentInstance } from 'vue';
import { Search, Result } from '@/utils/search';
import { ListChannel } from '@/api/manager/channel/api';
import { ListField } from '@/api/manager/field/api';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const props = defineProps<{
	data: App;
}>();

type Type = CreateAppRequest | UpdateAppRequest;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);
const { proxy } = getCurrentInstance() as any;

const channels = ref<Result[]>([]);
const fields = ref<Result[]>([]);

const searchChannelFactory = new Search(
	channels.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListChannel({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: `${item.name}（${item.description}）`, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.channelIds.includes(val as number);
	}
);
searchChannelFactory.Search();

const searchFieldFactory = new Search(
	fields.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListField({ ...req, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.fieldIds.includes(val as number);
	}
);
searchFieldFactory.Search();

const handleGetApp = async () => {
	if (!props.data.id) return;
	const { data } = await GetApp({ id: props.data.id });
	form.value = { ...data, channelIds: [], fieldIds: [] };
	if (data.channels) {
		form.value.channelIds = data.channels.map((obj) => obj.id);
	}
	if (data.fields) {
		form.value.fieldIds = data.fields.map((obj) => obj.id);
	}
};

watch(
	() => props.data,
	() => {
		handleGetApp();
	}
);

const showAddDrawer = () => {
	visible.value = true;
	isAdd.value = true;
	handleGetApp();
};

const showUpdateDrawer = () => {
	visible.value = true;
	isAdd.value = false;
	handleGetApp();
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
	const data = form.value;
	try {
		if (isAdd.value) {
			await CreateApp(data as CreateAppRequest);
			Message.success('创建成功');
		} else {
			await UpdateApp(data as UpdateAppRequest);
			Message.success('更新成功');
		}
		emit('refresh');
		return true;
	} catch (e) {
		return false;
	}
};

const files = () => {
	if (props.data.logoUrl) {
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
</script>
