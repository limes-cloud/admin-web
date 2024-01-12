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
					v-model="form.server_id"
					placeholder="请选择服务"
					:scrollbar="true"
					:options="servers"
					:field-names="{ value: 'id', label: 'fullName' }"
					@search="search"
					@change="change"
				></a-select>
			</div>
		</div>
		<div v-if="form.server_id">
			<div class="item">
				<span class="label">服务名称</span>
				<span class="value">{{ current?.name }}</span>
			</div>
			<div class="item">
				<span class="label">服务标志</span>
				<span class="value">{{ current?.keyword }}</span>
			</div>
		</div>
		<div v-if="form.server_id" class="hr" style="margin-top: 20px; margin-bottom: 10px">
			<span class="icon"></span>
			<span>模板信息</span>
		</div>
		<div v-if="template?.id">
			<div class="item">
				<span class="label">当前版本</span>
				<span class="value">
					{{ template?.version }}
					<a-tooltip content="切换模板版本" position="top">
						<span v-permission="'configure:template:history'" class="swap" @click="handleClickSwapTemplate"><icon-swap /></span>
					</a-tooltip>
				</span>
			</div>
			<div class="item">
				<span class="label">创建时间</span>
				<span class="value">{{ $formatTime(template?.created_at) }}</span>
			</div>
			<div class="item">
				<span class="label">版本描述</span>
				<span class="value">{{ template.description ? template.description : '暂无描述' }}</span>
			</div>
		</div>
		<div v-if="!template?.id || !form?.server_id" class="empty">
			<a-empty>
				<template #image>
					<icon-exclamation-circle-fill />
				</template>
				{{ form?.server_id ? '暂无配置数据' : '请先选择服务' }}
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
								版本号：{{ item.version }}
								<a-tag v-if="template?.id === item.id" size="small" color="arcoblue">使用中</a-tag>
							</div>
							<a-tooltip :content="item.description">
								<div class="description">版本描述：{{ item.description }}</div>
							</a-tooltip>
							<div class="version">提交时间：{{ $formatTime(item.created_at) }}</div>
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
import { onMounted, ref } from 'vue';
import { pageServer } from '@/api/configure/server';
import { Server } from '@/api/configure/types/server';
import { Template } from '@/api/configure/types/template';
import { pageTemplate, switchTemplate } from '@/api/configure/template';
import { Message } from '@arco-design/web-vue';
import Compare from './compare.vue';

const props = defineProps<{
	template?: Template;
}>();
const emit = defineEmits(['select', 'switch']);

const form = ref<{
	server_id?: number;
}>({});
const servers = ref<Server[]>([]);
const current = ref<Server>();
const templateVisible = ref(false);
const templateList = ref<Template[]>([]);
const curTempId = ref(props.template?.id);
const compareVisible = ref(false);
const compareData = ref([]);

const search = async (val?: string) => {
	const { data } = await pageServer({ page: 1, page_size: 10, keyword: val });
	const { list } = data;
	if (!list) {
		return;
	}

	// 初始化
	const searchd: Server[] = [];
	list.forEach((item) => {
		if (form.value.server_id !== item.id) {
			item.fullName = `${item.name}(${item.keyword})`;
			searchd.push(item);
		}
	});

	const selectd: Server[] = [];
	servers.value.forEach((item) => {
		if (item.id === form.value.server_id) {
			selectd.push(item);
		}
	});

	servers.value = searchd.concat(selectd);
};

const change = (val: any) => {
	servers.value.forEach((item) => {
		if (item.id === val) {
			current.value = item;
		}
	});
	emit('select', val);
};

const handleClickSwapTemplate = async () => {
	const { data } = await pageTemplate({ page: 1, page_size: 15, server_id: form.value.server_id as number });
	templateList.value = data.list;

	templateVisible.value = true;
};

const handleSwitchTemplate = async () => {
	await switchTemplate({ server_id: form.value.server_id as number, id: curTempId.value as number });
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

onMounted(() => {
	search();
});
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

	.empty {
		position: absolute;
		top: 150px;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 300px;
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
