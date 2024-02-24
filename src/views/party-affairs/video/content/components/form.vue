<template>
	<a-drawer
		v-model:visible="visible"
		:title="isAdd ? '新建' : '修改'"
		width="380px"
		unmount-on-close
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="classify_id"
				label="所属板块"
				:rules="[{ required: true, message: '所属板块是必填项' }]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.classify_id"
					placeholder="请选择视频分类"
					:scrollbar="true"
					:options="innerClassifys"
					allow-search
					:field-names="{ value: 'id', label: 'name' }"
					@search="search"
				></a-select>
			</a-form-item>

			<a-form-item field="title" label="视频标题" :rules="[{ required: true, message: '视频标题是必填项' }]" :validate-trigger="['change', 'input']">
				<a-input v-model="form.title" allow-clear placeholder="请输入视频标题" />
			</a-form-item>

			<a-form-item field="url" label="视频文件" :rules="[{ required: true, message: '视频文件是必填项' }]" :validate-trigger="['change', 'input']">
				<Upload
					ref="upload"
					width="100%"
					height="100px"
					text="点击或拖拽上传"
					:limit="1"
					:draggable="true"
					:multiple="false"
					:auto-upload="true"
					:files="files()"
					directory-path="video/content"
					app="partyaffairs"
					list-type="text"
					accept="video/*"
					@change="handleUploadImage"
				/>
			</a-form-item>

			<a-form-item
				field="desc"
				label="视频简述"
				:rules="[
					{
						required: true,
						message: '视频简述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.desc" allow-clear placeholder="请输入视频简述" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ComponentInternalInstance, getCurrentInstance, onMounted, ref, watch } from 'vue';
import { VideoContent, VideoClassify } from '@/api/party-affairs/types/video';
import { FileItem } from '@arco-design/web-vue';
import { pageVideoClassify } from '@/api/party-affairs/video';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const innerClassifys = ref<VideoClassify[]>([]);

const props = defineProps<{
	data: VideoContent;
}>();

const form = ref({} as VideoContent);
const emit = defineEmits(['add', 'update']);

watch(
	() => props.data,
	(val) => {
		form.value = val;
		if (val.classify) {
			innerClassifys.value.push(form.value.classify);
		}
	}
);

const files = () => {
	return form.value.resource
		? [
				{
					url: proxy?.$rurl(form.value.resource.src, 100, 100),
					sha: form.value.resource.sha,
					name: form.value.resource.name
				}
		  ]
		: [];
};

const handleUploadImage = (fs: FileItem[]) => {
	if (!fs || !fs.length) {
		form.value.url = '';
	} else {
		const file = fs[0];
		// 获取视频长度
		const video = document.createElement('video');
		video.src = file.url as string;
		video.onloadedmetadata = () => {
			form.value.duration = Math.ceil(video.duration);
		};

		form.value.url = file.response.sha;
	}
};

const showAddDrawer = () => {
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = async () => {
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

const search = async (val?: string) => {
	const { data } = await pageVideoClassify({ page: 1, page_size: 10, name: val });
	const { list } = data;
	if (!list) {
		return;
	}

	const searchd: VideoClassify[] = [];
	list.forEach((item) => {
		if (form.value.classify_id !== item.id) {
			searchd.push(item);
		}
	});

	innerClassifys.value = searchd;
};

onMounted(() => {
	search();
});
</script>
