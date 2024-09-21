<template>
	<a-modal
		v-model:visible="visible"
		unmount-on-close
		hide-title
		:width="800"
		:footer="false"
		:body-style="{ position: 'relative' }"
		@cancel="visible = false"
	>
		<span class="close" @click="visible = false"><icon-close-circle :size="18" /></span>
		<a-tabs>
			<a-tab-pane v-if="$hasPermission('application:auth:query')" key="app">
				<template #title>
					<icon-apps />
					应用列表
				</template>
				<App :user-id="userId" />
			</a-tab-pane>
			<a-tab-pane v-if="$hasPermission('application:oauth:query')" key="channel">
				<template #title>
					<icon-mind-mapping />
					渠道列表
				</template>
				<Channel :user-id="userId" />
			</a-tab-pane>
			<a-tab-pane v-if="$hasPermission('application:userinfo:query')" key="extra">
				<template #title>
					<icon-list />
					详细信息
				</template>
				<Userinfo :user-id="userId" />
			</a-tab-pane>
		</a-tabs>
	</a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import App from './more/app.vue';
import Channel from './more/channel.vue';
import Userinfo from './more/userinfo.vue';

const userId = ref(0);
const visible = ref(false);

const show = (id: number) => {
	userId.value = id;
	visible.value = true;
};

const close = () => {
	visible.value = false;
};

defineExpose({ show, close });
</script>

<style lang="less" scoped>
.content {
	height: 350px;
}

.close {
	position: absolute;
	top: 10px;
	right: 10px;
	cursor: pointer;
}
</style>
