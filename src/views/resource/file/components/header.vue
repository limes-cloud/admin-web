<template>
	<div class="header">
		<template v-if="!disable">
			<a-badge
				v-permission="'resource:file:delete'"
				class="badge"
				:offset="[-10, 2]"
				:count="selectdLength"
				:dot-style="{
					width: '15px',
					height: '15px',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center'
				}"
			>
				<div class="icon" :class="selectdLength ? '' : 'disable'">
					<a-tooltip content="删除" mini :content-style="tipStyle">
						<span @click="emit('deleteFile')"><icon-delete size="22" :stroke-width="2" /></span>
					</a-tooltip>
				</div>
			</a-badge>

			<div v-permission="'resource:file:query'" class="icon">
				<a-tooltip content="列表展示" mini :content-style="tipStyle">
					<span :class="!showCard ? 'active' : ''" @click="changeShowCard"><icon-mind-mapping size="22" :stroke-width="2" /></span>
				</a-tooltip>
			</div>

			<div v-permission="'resource:file:query'" class="icon">
				<a-tooltip content="图标展示" mini :content-style="tipStyle">
					<span :class="showCard ? 'active' : ''" @click="changeShowCard"><icon-apps size="22" :stroke-width="2" /></span>
				</a-tooltip>
			</div>

			<div v-permission="'resource:file:upload:group'" class="icon">
				<a-tooltip content="上传文件" mini :content-style="tipStyle">
					<span @click="uploadFileVisible = true"><icon-upload size="22" :stroke-width="2" /></span>
				</a-tooltip>
			</div>

			<div v-permission="'resource:file:query'" class="search-input">
				<a-input-search :style="{ width: '180px' }" placeholder="请输入文件名" allow-clear search-button @search="handleSearchFile"></a-input-search>
			</div>
		</template>
	</div>

	<a-modal
		v-model:visible="uploadFileVisible"
		width="480px"
		title="文件上传"
		:on-before-ok="handleUploadFile"
		:body-style="{ padding: '15px 15px' }"
		unmount-on-close
	>
		<Upload ref="upload" :size="100" :multiple="true" :auto-upload="false" :directory-id="directoryId" :app="app" list-type="text" accept="*"></Upload>
	</a-modal>

	<a-modal
		v-model:visible="newFileVisible"
		width="380px"
		title="新建文件夹"
		:on-before-ok="handleCreateDir"
		:body-style="{ padding: '15px 15px' }"
		unmount-on-close
	>
		<a-form :model="newFileForm" layout="vertical">
			<a-form-item label-width="0">
				<a-input v-model="newFileForm.name" placeholder="请输入文件夹名称" />
			</a-form-item>
		</a-form>
	</a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Upload from '@/components/upload/index.vue';

const tipStyle = { fontSize: '12px' };
const uploadFileVisible = ref(false);
const upload = ref();
const newFileForm = ref({ name: '' });
const newFileVisible = ref(false);
const showCard = ref(false);
const emit = defineEmits(['upload', 'createDir', 'changeShowCard', 'deleteFile', 'searchFile']);
defineProps<{
	selectdLength: number;
	disable: boolean;
	app: string;
	directoryId: number;
}>();

const handleUploadFile = async () => {
	upload.value.Upload();
	let is = false;
	await upload.value
		.WaitUploadSuccess()
		.then(() => {
			is = true;
		})
		.catch(() => {
			is = false;
		});
	return is;
};

const handleCreateDir = () => {
	emit('createDir', newFileForm);
	return true;
};

const changeShowCard = () => {
	showCard.value = !showCard.value;
	emit('changeShowCard', showCard.value);
};

const handleSearchFile = (val: string) => {
	emit('searchFile', val);
};
</script>

<style lang="less" scoped>
.header {
	display: flex;
	align-items: center;
	height: 40px;

	.icon {
		padding: 0 10px;

		span {
			display: block;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 32px;
			height: 32px;
			margin: auto;
			cursor: pointer;

			&:hover {
				background-color: var(--color-neutral-2);
			}
		}

		text-align: center;
	}

	.active {
		background-color: var(--color-neutral-2);
	}

	.disable {
		color: var(--color-text-4);
	}

	.path-input {
		flex: 1;
		min-width: 220px;
		padding: 0 15px;
	}

	.search-input {
		padding: 0 15px;
	}
}
</style>
