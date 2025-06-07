<template>
	<Popup v-model:visible="visible" :title="isAdd ? '新建模板' : '修改模板'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="channelId"
				label="通知渠道"
				:rules="[
					{
						required: true,
						message: '通知渠道是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.channelId"
					placeholder="请选择通知渠道"
					:scrollbar="true"
					:options="groups"
					@change="handleSelectChannel"
					@search="searchFactory.Search"
					@dropdown-reach-bottom="searchFactory.NextSearch"
				/>
			</a-form-item>

			<a-form-item
				field="weight"
				label="通知权重"
				:rules="[
					{
						required: true,
						message: '通知权重是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-number v-model="form.weight" allow-clear placeholder="请输入通知权重" />
			</a-form-item>

			<template v-if="ctype === 'email'">
				<a-form-item
					field="content"
					label="通知模板"
					:rules="[
						{
							required: true,
							message: '通知模板是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<CodeEditor
						v-model="form.content"
						lang="html"
						:show-line="false"
						:show-switch-lang="false"
						:show-fullscreen="true"
						:style="{
							width: '100%',
							height: '300px'
						}"
					></CodeEditor>
				</a-form-item>
			</template>

			<template v-if="ctype === 'official_account'">
				<a-form-item
					field="extra.templateId"
					label="模板绑定"
					:rules="[
						{
							required: true,
							message: '模板绑定是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-select v-model="form.extra.templateId" allow-search placeholder="请选择绑定的模板" @change="handleOfficalTemplateChange">
						<template v-for="(item, index) in ots" :key="index">
							<a-option :value="item.templateId">{{ item.title }}</a-option>
						</template>
					</a-select>
				</a-form-item>

				<a-divider orientation="left">模板字段配置</a-divider>
				<template v-for="(item, index) in form.extra.fields" :key="index">
					<a-form-item
						:field="'extra.fields[' + index + '].value'"
						:label="item.name"
						:rules="[
							{
								required: true,
								message: '模板绑定是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-input v-model="form.extra.fields[index].value" placeholder="请输入模板字段值"></a-input>
						<a-color-picker v-model="form.extra.fields[index].color" default-value="#000" format="hex" show-text disabled-alpha />
					</a-form-item>
				</template>

				<a-form-item
					label="跳转方式"
					field="extra.jumpType"
					:rules="[
						{
							required: true,
							message: '跳转方式是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-select v-model="form.extra.jumpType" allow-search placeholder="请选择跳转方式">
						<a-option value="none">不启用</a-option>
						<a-option value="url">链接</a-option>
						<a-option value="program">小程序</a-option>
					</a-select>
				</a-form-item>
				<a-form-item
					v-if="form.extra.jumpType === 'url'"
					label="链接地址"
					field="extra.url"
					:rules="[
						{
							required: true,
							message: '链接地址是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-input v-model="form.extra.url" allow-clear placeholder="请输入链接地址" />
				</a-form-item>

				<template v-if="form.extra.jumpType === 'program'">
					<a-form-item
						label="小程序id"
						field="extra.miniProgram.appId"
						:rules="[
							{
								required: true,
								message: '小程序id是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-input v-model="form.extra.miniProgram.appId" allow-clear placeholder="请输入小程序id" />
					</a-form-item>

					<a-form-item
						label="小程序路径"
						field="extra.miniProgram.pagePath"
						:rules="[
							{
								required: true,
								message: '小程序路径是必填项'
							}
						]"
						:validate-trigger="['change', 'input']"
					>
						<a-input v-model="form.extra.miniProgram.pagePath" allow-clear placeholder="请输入小程序路径" />
					</a-form-item>
				</template>
			</template>
		</a-form>
	</Popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { CreateTemplateRequest, UpdateTemplateRequest, Template } from '@/api/notify/template/type';
import { CreateTemplate, UpdateTemplate } from '@/api/notify/template/api';
import { Message } from '@arco-design/web-vue';
import { Result, Search } from '@/utils/search';
import { ListChannel, ListOfficialTemplate } from '@/api/notify/channel/api';
import { OfficialTemplate } from '@/api/notify/channel/type';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const ctype = ref('');

const props = defineProps<{
	data: Template;
}>();

type CResult = Result & { type: string };
type Type = (CreateTemplateRequest | UpdateTemplateRequest) & { extra: OfficialTemplate };
const form = ref<Type>({} as Type);
const emit = defineEmits(['refresh']);
const groups = ref<CResult[]>([]);
const ots = ref<OfficialTemplate[]>([]);
// const ot = ref<OfficialTemplate>();

watch(
	() => props.data,
	(val) => {
		form.value = { ...val, extra: {} as OfficialTemplate };
		if (val.channel) {
			ctype.value = val.channel.type;
		}
		if (val.channel.type === 'official_account') {
			try {
				ListOfficialTemplate({ id: val.channelId }).then((res) => {
					ots.value = res.data.list;
				});
				form.value.extra = JSON.parse(val.content);
			} catch (error) {
				form.value.extra = {} as OfficialTemplate;
			}
		}
	}
);

const searchFactory = new Search(
	groups.value,
	async (req): Promise<Result[]> => {
		const res: CResult[] = [];
		const { data } = await ListChannel({ ...req, status: true, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id, type: item.type });
		});
		return res;
	},
	(val): boolean => {
		return form.value.channelId === val;
	}
);

const handleOfficalTemplateChange = (val) => {
	ots.value.forEach((item) => {
		if (item.templateId === val) {
			form.value.extra = item;
		}
	});
};

const handleSelectChannel = async (val) => {
	groups.value.forEach((item) => {
		if (item.value === val) {
			ctype.value = item.type;
		}
	});
	if (ctype.value === 'official_account') {
		const { data } = await ListOfficialTemplate({ id: val });
		ots.value = data.list;
	}
};

const showAddDrawer = () => {
	searchFactory.Search();

	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = () => {
	searchFactory.Search();

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
	data.content = JSON.stringify(data.extra);
	if (isAdd.value) {
		await CreateTemplate(data as CreateTemplateRequest);
		Message.success('创建成功');
	} else {
		await UpdateTemplate(data as UpdateTemplateRequest);
		Message.success('更新成功');
	}
	emit('refresh');
	return true;
};
</script>
