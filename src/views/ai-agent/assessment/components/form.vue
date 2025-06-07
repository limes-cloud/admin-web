<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" unmount-on-close @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" auto-label-width>
			<a-form-item
				field="title"
				label="评估标题"
				:rules="[
					{
						required: true,
						message: '评估标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" allow-clear placeholder="请输入评估标题" />
			</a-form-item>

			<a-form-item
				field="description"
				label="评估描述"
				:rules="[
					{
						required: true,
						message: '评估描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入评估描述" />
			</a-form-item>

			<a-form-item
				field="prompt"
				label="提示词"
				:rules="[
					{
						required: true,
						message: '提示词是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.prompt" allow-clear placeholder="请输入提示词" />
			</a-form-item>

			<a-form-item
				field="models"
				label="评估模型"
				:rules="[
					{
						required: true,
						message: '评估模型是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.models"
					placeholder="请选择评估模型"
					multiple
					:scrollbar="true"
					:options="models"
					@search="modelSearch.Search"
					@dropdown-reach-bottom="modelSearch.NextSearch"
				/>
			</a-form-item>

			<a-form-item field="knowledges" label="知识库">
				<a-select
					v-model="form.knowledges"
					placeholder="请选择知识库"
					multiple
					:scrollbar="true"
					:options="kns"
					@search="knSearch.Search"
					@dropdown-reach-bottom="knSearch.NextSearch"
				/>
			</a-form-item>

			<a-form-item field="tools" label="挂载工具">
				<a-select
					v-model="form.tools"
					placeholder="请选择挂载工具"
					multiple
					:scrollbar="true"
					:options="tools"
					@search="toolSearch.Search"
					@dropdown-reach-bottom="toolSearch.NextSearch"
				/>
			</a-form-item>

			<a-form-item
				field="temperature"
				label="温度"
				tooltip="temperature：较高的数值会使输出更加随机，而较低的数值会使其更加集中和确定。建议该参数和top_p只设置1个。"
			>
				<a-slider v-model="form.temperature" :step="0.1" :min="0" :max="1" :show-ticks="true" :style="{ width: '90%' }" />
			</a-form-item>

			<a-form-item field="topP" label="多样性" tooltip="top_p：影响输出文本的多样性，取值越大，生成文本的多样性越强。建议该参数和temperature只设置1个。">
				<a-slider v-model="form.topP" :step="0.1" :min="0" :max="1" :show-ticks="true" :style="{ width: '90%' }" />
			</a-form-item>

			<a-form-item
				field="penaltyScore"
				label="重复惩罚"
				tooltip="penalty_score：用通过对已生成的token增加惩罚，减少重复生成的现象。说明：值越大表示惩罚越大。"
			>
				<a-slider v-model="form.penaltyScore" :step="0.1" :min="1.0" :max="2.0" :show-ticks="true" :style="{ width: '90%' }" />
			</a-form-item>
			<a-form-item
				field="topK"
				label="采样"
				tooltip="Top-K 采样参数，在每轮token生成时，保留k个概率最高的token作为候选。影响输出文本的多样性，取值越大，生成文本的多样性越强"
			>
				<a-input-number v-model="form.topK" :step="1" :min="1" :max="9999" allow-clear />
			</a-form-item>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CreateAssessmentRequest, Assessment, UpdateAssessmentRequest } from '@/api/ai-agent/assessment/type';
import { CreateAssessment, UpdateAssessment } from '@/api/ai-agent/assessment/api';
import { Message } from '@arco-design/web-vue';
import { Result, Search } from '@/utils/search';
import { ListModel } from '@/api/ai-agent/model/api';
import { ListKnowledge } from '@/api/ai-agent/knowledge/api';
import { ListTool } from '@/api/ai-agent/tool/api';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

type Type = CreateAssessmentRequest | UpdateAssessmentRequest | Assessment;
const form = ref<Type>({ models: [1] } as Type);
const emit = defineEmits(['refresh']);

const models = ref<Result[]>([]);
const kns = ref<Result[]>([]);
const tools = ref<Result[]>([]);

const modelSearch = new Search(
	models.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListModel({ ...req, type: 'chat', title: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.title, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return form.value.models.includes(val);
	}
);

const knSearch = new Search(
	kns.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListKnowledge({ ...req, title: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.title, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return Boolean(form.value.knowledges?.includes(val));
	}
);

const toolSearch = new Search(
	tools.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListTool({ ...req, title: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.title, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return Boolean(form.value.tools?.includes(val));
	}
);

const showAddDrawer = () => {
	modelSearch.Search();
	knSearch.Search();
	toolSearch.Search();

	form.value = {} as Type;
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = async (data: Assessment) => {
	form.value = { ...data, models: [], tools: [], knowledges: [] };

	data.modelList.forEach((item) => {
		form.value.models.push(item.id);
		if (!modelSearch.IsExist(item.id)) {
			models.value.push({ label: item.title, value: item.id } as Result);
		}
	});

	data.knowledgeList?.forEach((item) => {
		form.value.knowledges?.push(item.id);
		if (!knSearch.IsExist(item.id)) {
			kns.value.push({ label: item.title, value: item.id } as Result);
		}
	});

	data.toolList?.forEach((item) => {
		form.value.tools?.push(item.id);
		if (!toolSearch.IsExist(item.id)) {
			tools.value.push({ label: item.title, value: item.id } as Result);
		}
	});

	modelSearch.Search();
	knSearch.Search();
	toolSearch.Search();

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
		await CreateAssessment(data as CreateAssessmentRequest);
		Message.success('创建成功');
	} else {
		await UpdateAssessment(data as UpdateAssessmentRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
