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
import { addTemplate, currentTemplate } from '@/api/configure/template';
import { Message } from '@arco-design/web-vue';
import { Template, AddTemplateReq } from '@/api/configure/types/template';
import { syncConfigure } from '@/api/configure/configure';

import { Env } from '@/api/configure/types/env';
import { allEnv } from '@/api/configure/env';
import { SyncConfigureReq } from '@/api/configure/types/configure';
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
	const { data } = await allEnv();
	envs.value = data;
};

handleGetEnv();

const handleSelectServer = (val: number) => {
	serverId.value = val;
	getCurrentTemplate(val);
};

const handleTemplateSubmit = async (form: AddTemplateReq) => {
	form.server_id = serverId.value;
	await addTemplate(form);
	getCurrentTemplate(form.server_id);
	Message.success('模板提交成功');
};

const getCurrentTemplate = async (id: number) => {
	const { data } = await currentTemplate(id);
	template.value = data;
};

const handleSyncConfig = async (data: SyncConfigureReq) => {
	await syncConfigure(data);
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
