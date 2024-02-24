<template>
	<a-drawer
		v-model:visible="visible"
		unmount-on-close
		:title="isAdd ? '新建' : '修改'"
		width="380px"
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="right" layout="horizontal" auto-label-width>
			<a-form-item
				field="cover"
				label="分类封面"
				:rules="[
					{
						required: true,
						message: '分类封面是必填项'
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
					directory-path="video/cover"
					app="PartyAffairs"
					accept="image/*"
					@change="handleUploadImage"
				></Upload>
			</a-form-item>

			<a-form-item
				field="name"
				label="分类名称"
				:rules="[
					{
						required: true,
						message: '分类名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" placeholder="请输入分类名称" allow-clear />
			</a-form-item>

			<a-form-item
				field="weight"
				label="分类权重"
				:rules="[
					{
						required: true,
						message: '分类权重是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-number v-model="form.weight" placeholder="请输入分类权重" :default-value="0" mode="button" />
			</a-form-item>

			<a-form-item field="is_task" label="是否置顶" :rules="[{ required: true, message: '是否置顶是必选项' }]" :validate-trigger="['change', 'input']">
				<a-select
					v-model="form.is_top"
					placeholder="请选择是否置顶"
					:scrollbar="true"
					:options="[
						{ value: true, label: '是' },
						{ value: false, label: '否' }
					]"
				></a-select>
			</a-form-item>

			<a-form-item field="is_task" label="是否任务" :rules="[{ required: true, message: '是否任务是必选项' }]" :validate-trigger="['change', 'input']">
				<a-select
					v-model="form.is_task"
					placeholder="请选择是否任务"
					:scrollbar="true"
					:options="[
						{ value: true, label: '是' },
						{ value: false, label: '否' }
					]"
				></a-select>
			</a-form-item>

			<template v-if="form.is_task">
				<a-form-item
					label="开始时间"
					field="start"
					:rules="[
						{
							required: true,
							message: '开始时间是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-date-picker v-model="form.start" :style="{ width: '100%' }" show-time format="YYYY-MM-DD HH:mm:ss" value-format="timestamp" />
				</a-form-item>

				<a-form-item
					label="结束时间"
					field="end"
					:rules="[
						{
							required: true,
							message: '结束时间是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-date-picker v-model="form.end" :style="{ width: '100%' }" show-time format="YYYY-MM-DD HH:mm:ss" value-format="timestamp" />
				</a-form-item>
			</template>

			<a-form-item
				field="desc"
				label="分类描述"
				:rules="[
					{
						required: true,
						message: '结束时间是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.desc" placeholder="请输入分类描述" allow-clear />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
import { FileItem } from '@arco-design/web-vue/es/upload/interfaces';
import { ref, watch, getCurrentInstance } from 'vue';
import { VideoClassify } from '@/api/party-affairs/types/video';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const props = defineProps<{
	data: VideoClassify;
	channels: SelectOptionData[];
	extraFields: SelectOptionData[];
}>();

const { proxy } = getCurrentInstance() as any;
const form = ref<VideoClassify>({ ...props.data });
const emit = defineEmits(['add', 'update']);

watch(
	() => props.data,
	(val) => {
		form.value = { ...val, start: val.start * 1000, end: val.end * 1000 };
	}
);

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

	const start = Math.ceil(form.value.start / 1000);
	const end = Math.ceil(form.value.end / 1000);
	if (isAdd.value) {
		emit('add', { ...form.value, start, end });
	} else {
		emit('update', { ...form.value, start, end });
	}
	return true;
};

const files = () => {
	if (props.data.resource) {
		return [
			{
				url: proxy.$rurl(props.data.resource.src, 100, 100),
				sha: props.data.resource.sha,
				name: props.data.resource.name
			}
		];
	}
	return [];
};

const handleUploadImage = (fs: FileItem[]) => {
	if (!fs || !fs.length) return;
	const file = fs[0];
	form.value.cover = file.response.sha;
};
</script>
