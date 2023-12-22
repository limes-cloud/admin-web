<template>
	<div class="container">
		<Breadcrumb />
		<div
			class="general-card"
			:style="{
				display: 'flex',
				flexDirection: 'row',
				height: 'calc(100vh - ' + pageOhterHeight + 'px' + ')'
			}"
		>
			<div class="directory">
				<DirectoryTree @select-directory="handleSelectDirectory"></DirectoryTree>
			</div>
			<div class="file">
				<Header
					:disable="!pageFileParams.directory_id"
					:selectd-length="selectFile.length"
					:app="pageFileParams.app"
					:directory-id="pageFileParams.directory_id"
					@upload="handleUploadFile"
					@change-show-card="
            (is:boolean) => {
              showCard = is;
            }
           "
					@delete-file="handleBatchDeleteFile"
					@search-file="handlerSearchFile"
				></Header>
				<Body
					:total="fileTotal"
					:show-card="showCard"
					:file-list="fileList"
					:multiple-select="false"
					@select-file="handleSelectFile"
					@delete-file="handleDeleteFile"
					@update-file="handleUpdateFile"
				></Body>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Message from '@arco-design/web-vue/es/message';
import { FileItem } from '@arco-design/web-vue';
import { File, PageFileReq } from '@/api/resource/types/file';
import useAppStore from '@/store/modules/app';
import { deleteFile, pageFile, updateFile } from '@/api/resource/file';
import Header from './components/header.vue';
import Body from './components/body.vue';
import DirectoryTree from './components/directory.vue';

const appStore = useAppStore();
const pageOhterHeight = ref(56 + 58 + 20);
if (appStore.footer) {
	pageOhterHeight.value += 40;
}
if (appStore.tabBar) {
	pageOhterHeight.value += 32;
}

const selectFile = ref<number[]>([]);
const showCard = ref(false);
const fileList = ref<File[]>([]);
const fileTotal = ref(0);
const pageFileParams = ref<PageFileReq>({
	directory_id: 0,
	app: '',
	name: '',
	page: 1,
	page_size: 20
});

const fetchFile = async () => {
	const { data } = await pageFile(pageFileParams.value);
	fileTotal.value = data.total;
	fileList.value = data.list;
};

const handlerSearchFile = (name: string) => {
	pageFileParams.value.name = name;
	pageFileParams.value.page = 1;
	pageFileParams.value.page_size = 20;
	fetchFile();
};

const handleSelectDirectory = (app: string, id: number) => {
	if (!id) return;
	pageFileParams.value.app = app;
	pageFileParams.value.directory_id = id;
	pageFileParams.value.name = '';
	pageFileParams.value.page = 1;
	pageFileParams.value.page_size = 20;
	fetchFile();
};

const handleSelectFile = (ids: number[]) => {
	selectFile.value = ids;
};

const handleUploadFile = (list: FileItem) => {
	fetchFile();
};

const handleBatchDeleteFile = async (ids: number) => {
	await deleteFile({
		ids: selectFile.value,
		app: pageFileParams.value.app,
		directory_id: pageFileParams.value.directory_id
	});
	fetchFile();
	Message.success('删除成功！');
};

const handleDeleteFile = async (id: number) => {
	await deleteFile({
		ids: [id],
		app: pageFileParams.value.app,
		directory_id: pageFileParams.value.directory_id
	});
	fetchFile();
	Message.success('删除成功！');
};

const handleUpdateFile = async (id: number, name: string) => {
	await updateFile({
		id,
		directory_id: pageFileParams.value.directory_id,
		app: pageFileParams.value.app,
		name
	});
	fetchFile();
	Message.success('修改成功！');
};
</script>

<script lang="ts">
export default {
	name: 'File'
};
</script>

<style scoped lang="less">
.container {
	padding: 0 20px 20px;

	.general-card {
		padding-top: 0;

		.directory {
			position: relative;
			width: 250px;
			min-width: 250px;
			max-width: 250px;
			height: 100%;
			padding: 10px 15px;
			background: #fff;
			border: 1px solid #f2f2fe;
			border-radius: 4px;
		}

		.file {
			position: relative;
			width: calc(100% - 250px);
			min-width: calc(100% - 250px);
			max-width: calc(100% - 250px);
			height: 100%;
			margin-right: 15px;
			margin-left: 15px;
			padding: 10px 15px;
			background: #fff;
			border: 1px solid #f2f2fe;
			border-radius: 4px;
		}
	}
}
</style>
