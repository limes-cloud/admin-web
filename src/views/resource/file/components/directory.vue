<template>
	<div class="app">
		<div>
			<div class="select-input">
				<a-select
					v-model="form.keyword"
					placeholder="请选择服务"
					:scrollbar="true"
					:options="servers"
					:field-names="{ value: 'keyword', label: 'fullName' }"
					@search="searchApp"
					@change="changeApp"
				></a-select>
			</div>
		</div>
		<div class="tree">
			<a-tree
				v-if="form.keyword"
				:block-node="true"
				:data="treeData"
				:field-names="{ key: 'id', title: 'name' }"
				:load-more="fetchDirectory"
				@select="selectDirectory"
			>
				<template #icon>
					<FileIcon type="dir" :size="18"></FileIcon>
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
							<a-doption v-permission="'resource:directory:update'" @click="showUpdateDirectory(node)">
								<span class="file-font-blue">修改目录</span>
							</a-doption>
							<a-doption v-permission="'resource:directory:delete'" @click="handleDelDirectory(node)">
								<span class="file-font-red">删除目录</span>
							</a-doption>
						</template>
					</a-dropdown>
				</template>
			</a-tree>
			<div v-else class="empty">
				<a-empty>
					<template #image>
						<svgIcon class="bg" name="empty-record" :size="200"></svgIcon>
					</template>
					请选择服务
				</a-empty>
			</div>
		</div>

		<a-modal v-model:visible="submitVisible" simple :title="isAdd ? '新建目录' : '修改目录'" @cancel="submitVisible = false" @before-ok="handleSubmit">
			<a-form ref="submitFormRef" :model="submitForm" layout="vertical">
				<a-form-item
					field="name"
					label="请输入文件夹名称"
					:rules="[
						{
							required: true,
							message: '文件夹名称必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-input v-model="submitForm.name" placeholder="请输入" />
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { pageServer } from '@/api/configure/server';
import { Server } from '@/api/configure/types/server';
import { getDirectory, addDirectory, updateDirectory, deleteDirectory } from '@/api/resource/directory';
import { Directory } from '@/api/resource/types/directory';
import { Message } from '@arco-design/web-vue';
import { TreeNodeData } from '@arco-design/web-vue/es/tree/interface';
import { onMounted, ref } from 'vue';
import { findNode } from '@/utils/index';
import FileIcon from './icon.vue';

const emit = defineEmits(['selectDirectory']);
const submitForm = ref({
	parent_id: 0,
	app: '',
	name: ''
});

const isAdd = ref(true);
const submitVisible = ref(false);
const treeData = ref<Directory[]>([]);
const defaultRootTree = {
	id: 0,
	parent_id: 0,
	name: '文件根目录',
	children: []
};

const parentId = ref(0);
const form = ref({ keyword: '' });
const servers = ref<Server[]>([]);
const curNode = ref({} as TreeNodeData);

const fetchDirectory = (nodeData: TreeNodeData) => {
	parentId.value = (nodeData as Directory).id;
	return new Promise<void>((resolve) => {
		getDirectory({
			app: form.value.keyword,
			parent_id: parentId.value
		}).then((res) => {
			nodeData.children = res.data.list;
			resolve();
		});
	});
};

const showAddDirectory = (nodeData: TreeNodeData) => {
	curNode.value = nodeData;
	submitForm.value = {
		app: form.value.keyword,
		parent_id: (nodeData as Directory).id,
		name: ''
	};
	submitVisible.value = true;
};

const handleAddDirectory = async () => {
	let is = true;
	await addDirectory(submitForm.value)
		.then((res) => {
			const { data } = res;
			curNode.value.children?.push(data);
		})
		.catch(() => {
			is = false;
		});
	return is;
};

const showUpdateDirectory = (nodeData: TreeNodeData) => {
	curNode.value = nodeData;
	submitForm.value.name = (nodeData as Directory).name;
	submitVisible.value = true;
	isAdd.value = false;
};

const handleUpdateDirectory = async () => {
	const node = curNode.value as Directory;
	let is = true;
	await updateDirectory({
		id: node.id,
		name: submitForm.value.name,
		app: form.value.keyword
	})
		.then(() => {
			node.name = submitForm.value.name;
		})
		.catch(() => {
			is = false;
		});
	return is;
};

const handleDelDirectory = async (nodeData: TreeNodeData) => {
	console.log(nodeData);
	const node = nodeData as Directory;
	await deleteDirectory({ id: node.id, app: form.value.keyword });
	nodeData = {} as TreeNodeData;
	Message.success('删除成功');
	const targetNode = findNode(treeData.value[0], node.parent_id);
	if (targetNode) {
		let index = -1;
		targetNode.children.forEach((tar, ind) => {
			if (tar.id === node.id) {
				index = ind;
			}
			if (index !== -1) {
				targetNode.children.splice(index, 1);
			}
		});
	}
};

const handleSubmit = () => {
	return isAdd.value ? handleAddDirectory() : handleUpdateDirectory();
};

const searchApp = async (val?: string) => {
	const { data } = await pageServer({ page: 1, page_size: 10, keyword: val });
	const { list } = data;
	if (!list) {
		return;
	}

	// 初始化
	const searchd: Server[] = [];
	list.forEach((item) => {
		if (form.value.keyword !== item.keyword) {
			item.fullName = `${item.name}(${item.keyword})`;
			searchd.push(item);
		}
	});

	const selectd: Server[] = [];
	servers.value.forEach((item) => {
		if (item.keyword === form.value.keyword) {
			selectd.push(item);
		}
	});

	servers.value = searchd.concat(selectd);
};

const changeApp = () => {
	const root = { ...defaultRootTree };
	treeData.value = [root];
	fetchDirectory(treeData.value[0]);
};

const selectDirectory = (val: any) => {
	emit('selectDirectory', form.value.keyword, val[0]);
};

onMounted(() => {
	searchApp();
});
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
