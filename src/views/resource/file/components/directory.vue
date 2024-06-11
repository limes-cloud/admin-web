<template>
	<div class="app">
		<div class="tree">
			<a-tree :block-node="true" :data="directories" :field-names="{ key: 'id', title: 'name' }" :load-more="fetchDirectory" @select="selectDirectory">
				<template #icon>
					<FileIcon type="dir" :size="18"></FileIcon>
				</template>
				<template #title="node">
					<a-typography-paragraph
						:style="{ marginBottom: 0, width: 'calc(100% - 20px)' }"
						:ellipsis="{
							rows: 1,
							showTooltip: true
						}"
					>
						{{ node.name }}
					</a-typography-paragraph>
				</template>
				<template #extra="node">
					<a-dropdown
						v-if="$hasPermission('resource:directory:add') || $hasPermission('resource:directory:update') || $hasPermission('resource:directory:delete')"
						position="bottom"
					>
						<IconMoreVertical style="position: absolute; top: 10px; right: 8px; color: #000; font-size: 14px" />
						<template #content>
							<a-doption v-permission="'resource:directory:add'" @click="showAddDirectory(node)">
								<span class="file-font-blue">新建目录</span>
							</a-doption>
							<a-doption v-if="node.id != 0" v-permission="'resource:directory:update'" @click="showUpdateDirectory(node)">
								<span class="file-font-blue">修改目录</span>
							</a-doption>
							<a-doption v-if="node.id != 0" v-permission="'resource:directory:delete'" @click="handleDeleteDirectory(node)">
								<span class="file-font-red">删除目录</span>
							</a-doption>
						</template>
					</a-dropdown>
				</template>
			</a-tree>
		</div>

		<a-modal v-model:visible="submitVisible" simple :title="isAdd ? '新建目录' : '修改目录'" @cancel="submitVisible = false" @before-ok="handleSubmit">
			<a-form ref="submitFormRef" :model="submitForm" layout="vertical">
				<a-form-item
					field="name"
					label="请输入文件夹名称"
					:rules="[
						{
							required: true,
							message: '文件夹名称是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-input v-model="submitForm.name" placeholder="请输入文件夹名称" />
				</a-form-item>

				<a-form-item
					field="acceptArr"
					label="允许后缀"
					:rules="[
						{
							required: true,
							message: '允许后缀是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-input-tag v-model="submitForm.acceptArr" placeholder="请输入允许上传的文件后缀（回车确认）" />
				</a-form-item>

				<a-form-item
					field="maxSize"
					label="最大阈值"
					:rules="[
						{
							required: true,
							message: '文件大小阈值是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-input-number v-model="submitForm.maxSize" placeholder="请输入允许上传的文件大小阈值（单位:M ）" :precision="0" :min="1" :max="1000" />
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { Message } from '@arco-design/web-vue';
import { TreeNodeData } from '@arco-design/web-vue/es/tree/interface';
import { ref } from 'vue';
import { ListDirectory, CreateDirectory, UpdateDirectory, DeleteDirectory } from '@/api/resource/directory/api';
import { CreateDirectoryRequest, Directory, UpdateDirectoryRequest } from '@/api/resource/directory/type';
import FileIcon from './icon.vue';

const emit = defineEmits(['selectDirectory']);
type FormType = (CreateDirectoryRequest | UpdateDirectoryRequest) & { acceptArr: string[] };
const submitForm = ref<FormType>({} as FormType);

const isAdd = ref(true);
const submitVisible = ref(false);

const directories = ref<Directory[]>([]);

const defaultRootTree: Directory = {
	id: 0,
	parentId: 0,
	name: '文件根目录',
	accept: '',
	maxSize: 1,
	createdAt: 0,
	updatedAt: 0,
	children: []
};

const fetchDirectory = async () => {
	const { data } = await ListDirectory();
	const tree = { ...defaultRootTree };
	tree.children = data.list;
	directories.value = [tree];
};

fetchDirectory();

const showAddDirectory = (nodeData: TreeNodeData) => {
	submitForm.value = {
		parentId: (nodeData as Directory).id,
		name: '',
		accept: '',
		acceptArr: [],
		maxSize: 1
	};
	submitVisible.value = true;
};

const handleAddDirectory = async () => {
	let is = true;
	await CreateDirectory(submitForm.value)
		.then(() => {
			fetchDirectory();
		})
		.catch(() => {
			is = false;
		});
	return is;
};

const showUpdateDirectory = (nodeData: TreeNodeData) => {
	const node = nodeData as Directory;
	submitForm.value = {
		id: node.id,
		name: node.name,
		accept: node.accept,
		acceptArr: node.accept.split(','),
		parentId: node.parentId,
		maxSize: node.maxSize
	};
	submitVisible.value = true;
	isAdd.value = false;
};

const handleUpdateDirectory = async () => {
	let is = true;
	const value = submitForm.value as UpdateDirectoryRequest;
	await UpdateDirectory({
		id: value.id as number,
		parentId: value.parentId,
		name: value.name,
		accept: value.accept,
		maxSize: value.maxSize
	})
		.then(() => {
			fetchDirectory();
		})
		.catch(() => {
			is = false;
		});
	return is;
};

const handleDeleteDirectory = async (nodeData: TreeNodeData) => {
	const node = nodeData as Directory;
	await DeleteDirectory({ ids: [node.id] });
	fetchDirectory();
	Message.success('删除成功');
};

const handleSubmit = () => {
	submitForm.value.accept = submitForm.value.acceptArr.join(',');
	return isAdd.value ? handleAddDirectory() : handleUpdateDirectory();
};

const selectDirectory = (val: any) => {
	emit('selectDirectory', val[0]);
};
</script>

<style lang="less" scoped>
.app {
	height: 100%;

	.title {
		display: flex;
		align-items: center;
		margin-top: 8px;
		margin-bottom: 12px;
		color: #666;
		font-weight: 700;
		font-size: 14px;

		.icon {
			display: block;
			width: 5px;
			height: 16px;
			margin-right: 10px;
			background-color: #409eff;
			border-radius: 4px;
		}
	}

	.select-input {
		padding: 5px 0 12px;
	}

	.tree {
		height: calc(100% - 50px);
		overflow: scroll;

		&::-webkit-scrollbar {
			display: none;
		}

		.empty {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
		}
	}
}
</style>
