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
			<Left class="left" :template="template" @select="handleSelectServer" @switch="handleSwitchTemplate"></Left>
			<Center :template="template" :envs="envs" class="center" @submit="handleTemplateSubmit" @sync="handleSyncConfig"></Center>
			<Right :server-id="serverId" class="right"></Right>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useAppStore } from '@/store';
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { CreateTemplate, CurrentTemplate } from '@/api/configure/template/api';
import { Template, CreateTemplateRequest } from '@/api/configure/template/type';
import { SyncConfigure } from '@/api/configure/configure/api';

import { Env } from '@/api/configure/env/type';
import { ListEnv } from '@/api/configure/env/api';
import { SyncConfigureRequest } from '@/api/configure/configure/type';
import Left from './components/left.vue';
import Center from './components/center.vue';
import Right from './components/right.vue';

const appStore = useAppStore();
const pageOhterHeight = ref(56 + 58 + 20);
const serverId = ref(0);
const template = ref<Template>();
const envs = ref<Env[]>();
if (appStore.footer) {
	pageOhterHeight.value += 40;
}
if (appStore.tabBar) {
	pageOhterHeight.value += 32;
}

// handleGet 处理查询
const handleGetEnv = async () => {
	const { data } = await ListEnv();
	envs.value = data.list;
};

handleGetEnv();

const handleSelectServer = (val: number) => {
	serverId.value = val;
	getCurrentTemplate(val);
};

const handleTemplateSubmit = async (form: CreateTemplateRequest) => {
	form.serverId = serverId.value;
	await CreateTemplate(form);
	getCurrentTemplate(form.serverId);
	Message.success('模板提交成功');
};

const getCurrentTemplate = async (id: number) => {
	CurrentTemplate(id)
		.then((res) => {
			template.value = res.data;
		})
		.catch(() => {
			template.value = { format: 'yaml', serverId: serverId.value } as Template;
		});
};

const handleSyncConfig = async (data: SyncConfigureRequest) => {
	await SyncConfigure(data);
	Message.success('配置同步成功');
};

const handleSwitchTemplate = () => {
	getCurrentTemplate(serverId.value);
};
</script>

<script lang="ts">
export default {
	name: 'ConfigureResource'
};
</script>

<style lang="less" scoped>
// .container {
//   flex: 1;
// }
.general-card {
	.left {
		position: relative;
		width: 250px;
		min-width: 250px;
		max-width: 250px;
		height: 100%;
		padding: 10px 15px;
		background-color: var(--color-bg-2);
		border-radius: 4px;
	}

	.center {
		position: relative;
		width: calc(100% - 530px);
		min-width: calc(100% - 530px);
		max-width: calc(100% - 530px);
		height: 100%;
		margin-right: 15px;
		margin-left: 15px;
		padding: 10px 15px;
		background-color: var(--color-bg-2);
		border-radius: 4px;
	}

	.right {
		position: relative;
		flex: 250px;
		width: 250px;
		min-width: 250px;
		max-width: 250px;
		height: 100%;
		padding: 10px 15px;
		background-color: var(--color-bg-2);
		border-radius: 4px;
	}
}
</style>
