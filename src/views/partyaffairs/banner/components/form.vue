<template>
	<a-drawer
		v-model:visible="visible"
		:title="isAdd ? '新建' : '修改'"
		width="380px"
		unmount-on-close
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="right" layout="horizontal" auto-label-width>
			<a-form-item
				field="title"
				label="轮播标题"
				:rules="[
					{
						required: true,
						message: '轮播标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" allow-clear placeholder="请输入轮播标题" />
			</a-form-item>

			<a-form-item
				field="src"
				label="轮播封面"
				:rules="[
					{
						required: true,
						message: '轮播封面是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<Upload
					ref="upload"
					width="100%"
					height="180px"
					:limit="1"
					:draggable="true"
					:multiple="false"
					:auto-upload="true"
					:files="files()"
					directory-path="resource/banner"
					app="partyaffairs"
					accept="image/*"
					@change="handleUploadImage"
				></Upload>
			</a-form-item>

			<a-form-item label="跳转应用">
				<a-select v-model="jumpType">
					<template v-for="(item, key) in jumpTypes" :key="key">
						<a-option :value="key">{{ item }}</a-option>
					</template>
				</a-select>
			</a-form-item>

			<template v-if="jumpType == 'url'">
				<a-form-item
					field="url"
					label="外部链接"
					:rules="[
						{
							required: true,
							message: '外部链接是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-input v-model="form.url" allow-clear placeholder="请输入外部链接" />
				</a-form-item>
			</template>
			<template v-if="jumpType == 'app'">
				<a-form-item
					field="app"
					label="应用标志"
					:rules="[
						{
							required: true,
							message: '应用标志是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-input v-model="form.app" allow-clear placeholder="请输入应用标志" />
				</a-form-item>

				<a-form-item field="params" label="跳转参数">
					<a-input v-model="form.params" allow-clear placeholder="请输入跳转参数" />
				</a-form-item>
			</template>
			<a-form-item
				field="weight"
				label="轮播权重"
				:rules="[
					{
						required: true,
						message: '轮播权重是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-number v-model="form.weight" placeholder="请输入轮播权重" mode="button" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch, getCurrentInstance } from 'vue';
import { Banner } from '@/api/partyaffairs/types/banner';
import { FileItem } from '@arco-design/web-vue/es/upload/interfaces';

const { proxy } = getCurrentInstance() as any;
const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const jumpType = ref('none');
const jumpTypes = {
	none: '不跳转',
	app: '跳转应用',
	url: '外部url'
};

const props = defineProps<{
	data: Banner;
}>();

const form = ref<Banner>({} as Banner);
const emit = defineEmits(['add', 'update']);
const files = () => {
	if (props.data.resource) {
		return [
			{
				url: proxy.$rurl(props.data.resource.src, 300, 180),
				sha: props.data.resource.sha,
				name: props.data.resource.name
			}
		];
	}
	return [];
};

watch(
	() => props.data,
	(val) => {
		form.value = { ...val };
	}
);

const handleUploadImage = (fs: FileItem[]) => {
	console.log(fs);
	if (!fs || !fs.length) return;
	const file = fs[0];
	form.value.src = file.response.sha;
};

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

defineExpose({ showAddDrawer, showUpdateDrawer, closeDrawer });

const handleSubmit = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}

	if (isAdd.value) {
		emit('add', { ...form.value });
	} else {
		emit('update', { ...form.value });
	}
	return true;
};
</script>
