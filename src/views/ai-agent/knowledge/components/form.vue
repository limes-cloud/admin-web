<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="480px" unmount-on-close @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" auto-label-width>
			<a-form-item
				v-if="isAdd"
				field="sha"
				label="文件"
				:rules="[
					{
						required: true,
						message: '知识库文件是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<Upload
					ref="upload"
					:limit="1"
					:file-size="1024 * 50"
					:draggable="true"
					:multiple="false"
					:auto-upload="true"
					list-type="text"
					:files="files()"
					directory-path="ai-agent/knowledge"
					accept=".pdf,.pdfx,.csv,.html,.txt,.md,.doc,.docx"
					@change="handleUpload"
				></Upload>
			</a-form-item>

			<a-form-item
				field="title"
				label="标题"
				:rules="[
					{
						required: true,
						message: '标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" allow-clear placeholder="请输入标题" />
			</a-form-item>

			<a-form-item
				field="description"
				label="描述"
				:rules="[
					{
						required: true,
						message: '描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入描述" />
			</a-form-item>

			<a-form-item
				v-if="isAdd"
				field="modelId"
				label="向量模型"
				:rules="[
					{
						required: true,
						message: '向量模型是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.modelId"
					placeholder="请选择向量模型"
					:scrollbar="true"
					:options="groups"
					@search="searchFactory.Search"
					@dropdown-reach-bottom="searchFactory.NextSearch"
				/>
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Result, Search } from '@/utils/search';
import { CreateKnowledgeRequest, Knowledge, UpdateKnowledgeRequest } from '@/api/ai-agent/knowledge/type';
import { CreateKnowledge, UpdateKnowledge } from '@/api/ai-agent/knowledge/api';
import { FileItem, Message } from '@arco-design/web-vue';
import { ListModel } from '@/api/ai-agent/model/api';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

type Type = CreateKnowledgeRequest | UpdateKnowledgeRequest | Knowledge;
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);

const groups = ref<Result[]>([]);

const searchFactory = new Search(
	groups.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListModel({ ...req, type: 'embedding', title: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.title, value: item.id });
		});
		return res;
	},
	(val): boolean => {
		return form.value.modelId === val;
	}
);

const showAddDrawer = () => {
	searchFactory.Search();

	form.value = {} as Type;
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = async (data) => {
	if (!searchFactory.IsExist(data.groupId)) {
		groups.value.push({ label: data.group?.name, value: data.groupId } as Result);
	}

	searchFactory.Search();

	form.value = { ...data };
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

	const data = { ...form.value };
	if (isAdd.value) {
		await CreateKnowledge(data as CreateKnowledgeRequest);
		Message.success('创建成功');
	} else {
		await UpdateKnowledge(data as UpdateKnowledgeRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};

const files = () => {
	const data = form.value as Knowledge;
	if (data.sha) {
		return [
			{
				sha: data.sha,
				name: '已上传文件'
			}
		];
	}
	return [];
};

const handleUpload = (fs: FileItem[]) => {
	if (!fs || !fs.length) return;
	const file = fs[0];
	form.value.sha = file.response.sha;
	const arr = file.response.src.split('.');
	form.value.type = arr[arr.length - 1];
};
</script>
