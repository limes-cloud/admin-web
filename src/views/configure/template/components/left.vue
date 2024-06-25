<template>
	<div class="service">
		<div class="hr">
			<span class="icon"></span>
			<span class="title">服务信息</span>
		</div>
		<div class="item">
			<span class="label">所属服务</span>
			<div class="select-input">
				<a-select
					v-model="form.serverId"
					placeholder="请选择服务"
					:scrollbar="true"
					:options="servers"
					@search="searchFieldFactory.Search"
					@dropdown-reach-bottom="searchFieldFactory.NextSearch"
					@change="change"
				></a-select>
			</div>
		</div>
		<div v-if="form.serverId">
			<div class="item">
				<span class="label">服务名称</span>
				<span class="value">{{ current?.label }}</span>
			</div>
			<div class="item">
				<span class="label">服务标志</span>
				<span class="value">{{ current?.keyword }}</span>
			</div>
		</div>
		<div v-if="form.serverId" class="hr" style="margin-top: 20px; margin-bottom: 10px">
			<span class="icon"></span>
			<span>模板信息</span>
		</div>
		<div v-if="template?.id">
			<div class="item">
				<span class="label">当前版本</span>
				<span class="value">
					{{ template?.version.substring(0, 12) }}
					<a-tooltip content="切换模板版本" position="top">
						<span v-permission="'configure:template:history'" class="swap" @click="handleClickSwapTemplate"><icon-swap /></span>
					</a-tooltip>
				</span>
			</div>
			<div class="item">
				<span class="label">创建时间</span>
				<span class="value">{{ $formatTime(template?.createdAt) }}</span>
			</div>
			<div class="item">
				<span class="label">版本描述</span>
				<span class="value">{{ template.description ? template.description : '暂无描述' }}</span>
			</div>
		</div>
		<div v-if="!template?.id || !form?.serverId" class="empty-box">
			<a-empty>
				<template #image>
					<svgIcon name="empty-box" :size="120" />
				</template>
				{{ form?.serverId ? '暂无配置数据' : '请先选择服务' }}
			</a-empty>
		</div>

		<a-modal
			v-model:visible="templateVisible"
			title="切换配置"
			ok-text="确认切换"
			:ok-button-props="{ disabled: curTempId == template?.id }"
			width="900px"
			:body-style="{ height: '500px', padding: '0' }"
			unmount-on-close
			@cancel="templateVisible = false"
			@before-ok="handleSwitchTemplate"
		>
			<a-tabs
				:default-active-key="template?.id"
				direction="vertical"
				destroy-on-hide
				@change="
					(key) => {
						curTempId = key as number;
					}
				"
			>
				<a-tab-pane v-for="item in templateList" :key="item.id">
					<template #title>
						<div class="pane-title">
							<div class="version">
								版本号：{{ item.version.substring(0, 12) }}
								<a-tag v-if="template?.id === item.id" size="small" color="arcoblue">使用中</a-tag>
							</div>
							<a-tooltip :content="item.description">
								<div class="description">版本描述：{{ item.description }}</div>
							</a-tooltip>
							<div class="version">提交时间：{{ $formatTime(item.createdAt) }}</div>
							<div class="version">
								变更详情：
								<span class="compare" @click="showCompareInfo(item)">
									查看
									<icon-right />
								</span>
							</div>
						</div>
					</template>
					<CodeEditor
						:value="item?.content"
						:lang="item?.format"
						:show-line="false"
						:read-only="true"
						:style="{
							width: '100%',
							height: '500px'
						}"
					></CodeEditor>
				</a-tab-pane>
			</a-tabs>
		</a-modal>

		<a-modal
			v-model:visible="compareVisible"
			title="变更详情"
			width="900px"
			unmount-on-close
			:body-style="{ height: '500px', padding: '0' }"
			@cancel="compareVisible = false"
			@before-ok="compareVisible = false"
		>
			<Compare :data="compareData"></Compare>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { Result, Search } from '@/utils/search';
import { ListServer } from '@/api/configure/server/api';
import { Template } from '@/api/configure/template/type';
import { ListTemplate, SwitchTemplate } from '@/api/configure/template/api';
import Compare from './compare.vue';

const props = defineProps<{
	template?: Template;
}>();
const emit = defineEmits(['select', 'switch']);

const form = ref<{
	serverId?: number;
}>({});
type ServerType = Result & { keyword: string };
const servers = ref<ServerType[]>([]);
const current = ref<ServerType>();
const templateVisible = ref(false);
const templateList = ref<Template[]>([]);
const curTempId = ref(props.template?.id);
const compareVisible = ref(false);
const compareData = ref([]);

const change = (val: any) => {
	servers.value.forEach((item) => {
		if (item.value === val) {
			current.value = item;
		}
	});
	emit('select', form.value.serverId);
};

const searchFieldFactory = new Search(
	servers.value,
	async (req): Promise<Result[]> => {
		const res: ServerType[] = [];
		const { data } = await ListServer({ ...req, status: true, name: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.name, value: item.id, keyword: item.keyword });
		});
		return res;
	},
	(val): boolean => {
		return form.value.serverId === val;
	}
);
searchFieldFactory.Search();

const handleClickSwapTemplate = async () => {
	const { data } = await ListTemplate({ page: 1, pageSize: 15, serverId: form.value.serverId as number });
	templateList.value = data.list;

	templateVisible.value = true;
};

const handleSwitchTemplate = async () => {
	await SwitchTemplate({ serverId: form.value.serverId as number, id: curTempId.value as number });
	templateVisible.value = false;
	Message.success('模板切换成功');
	emit('switch');
};

const showCompareInfo = (item: Template) => {
	if (!item.compare) {
		Message.error('无变更信息');
		return;
	}
	compareData.value = JSON.parse(item.compare);
	compareVisible.value = true;
};
</script>

<style scoped lang="less">
.compare {
	color: rgb(var(--arcoblue-6));
}

.arco-tabs-vertical {
	height: 500px;
}

.pane-title {
	width: 200px;
	padding: 5px 0;
	overflow: hidden;
	font-size: 12px !important;

	.description {
		width: 100%;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
}

.service {
	.swap {
		color: rgb(var(--arcoblue-6));
		cursor: pointer;
	}

	.select-input {
		width: 150px;
		max-width: 150px;
	}

	.empty-box {
		width: 100%;
		height: 100%;

		.empty {
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.hr {
		display: flex;
		align-items: center;
		color: var(--color-text-2);
		font-weight: 700;
		font-size: 14px;

		.icon {
			display: block;
			width: 5px;
			height: 16px;
			margin-right: 10px;
			background-color: rgb(var(--arcoblue-6));
			border-radius: 4px;
		}
	}

	.item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 0;
		font-size: 13px;

		.label {
			width: 55px;
			min-width: 55px;
			margin-right: 10px;
			color: var(--color-text-2);
			font-weight: 700;
			white-space: nowrap;
		}

		.value {
			color: var(--color-text-3);
		}
	}

	.btn {
		margin-top: 15px;
		text-align: center;

		.el-button--primary {
			width: 100% !important;
		}
	}
}
</style>
