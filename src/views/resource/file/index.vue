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
					:disable="!ListFileParams.directoryId"
					:selectd-length="selectFile.length"
					:directory-id="ListFileParams.directoryId"
					@upload="handleUploadFile"
					@change-show-card="handleChangeShowCard"
					@delete-file="handleBatchDeleteFile"
					@search-file="handlerSearchFile"
					@export="handleExportFile"
				></Header>
				<Body
					:total="fileTotal"
					:show-card="showCard"
					:file-list="fileList"
					:multiple-select="false"
					@select-file="handleSelectFile"
					@delete-file="handleDeleteFile"
					@update-file="handleUpdateFile"
					@page-change="handlePageChange"
				></Body>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Message from '@arco-design/web-vue/es/message';
import { FileItem } from '@arco-design/web-vue';
import { File, ListFileRequest, UpdateFileRequest } from '@/api/resource/file/type';
import useAppStore from '@/store/modules/app';
import { DeleteFile, ListFile, UpdateFile } from '@/api/resource/file/api';
import { ExportFile } from '@/api/resource/export/api';
import { useUserStore } from '@/store';
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
const ListFileParams = ref<ListFileRequest>({
	directoryId: 0,
	page: 1,
	pageSize: 20,
	status: 'COMPLETED'
});

const fetchFile = async () => {
	const { data } = await ListFile(ListFileParams.value);
	fileTotal.value = data.total;
	fileList.value = data.list;
};

const handlerSearchFile = (name: string) => {
	ListFileParams.value.name = name;
	ListFileParams.value.page = 1;
	ListFileParams.value.pageSize = 20;
	fetchFile();
};

const handleSelectDirectory = (id: number) => {
	if (!id || id === ListFileParams.value.directoryId) return;
	ListFileParams.value.directoryId = id;
	ListFileParams.value.name = undefined;
	ListFileParams.value.page = 1;
	ListFileParams.value.pageSize = 20;
	fetchFile();
};

const handleSelectFile = (ids: number[]) => {
	selectFile.value = ids;
};

const handleUploadFile = (list: FileItem) => {
	fetchFile();
};

const handlePageChange = async (val) => {
	ListFileParams.value.page = val.current;
	ListFileParams.value.pageSize = val.pageSize;
	fetchFile();
};

const handleBatchDeleteFile = async (ids: number[]) => {
	await DeleteFile({
		ids
	});
	fetchFile();
	selectFile.value = [];
	Message.success('删除成功！');
};

const handleDeleteFile = async (id: number) => {
	await DeleteFile({ ids: [id] });
	fetchFile();
	Message.success('删除成功！');
	const index = selectFile.value.indexOf(id);
	if (index !== -1) {
		selectFile.value.splice(index, 1);
	}
};

const handleUpdateFile = async (data: UpdateFileRequest) => {
	await UpdateFile({ ...data });
	fetchFile();
	Message.success('修改成功！');
};

const handleExportFile = async (name: string) => {
	const info = useUserStore().$state;
	await ExportFile({
		userId: info.id,
		departmentId: info.department?.id as number,
		scene: 'ResourceExport',
		name,
		ids: selectFile.value
	});
	Message.success('导出任务添加成功！');
};

const handleChangeShowCard = (is: boolean) => {
	showCard.value = is;
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
			background-color: var(--color-bg-2);
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
			background-color: var(--color-bg-2);
			border-radius: 4px;
		}
	}
}
</style>
