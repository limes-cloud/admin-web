<template>
	<div class="container">
		<Breadcrumb />
		<a-card class="general-card">
			<div class="back">
				<icon-left />
				返回
			</div>
			<div class="chat">
				<Chat title="这是一个房间标题"></Chat>
			</div>
		</a-card>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Chat from '@/components/chat/index.vue';
import logo from '@/assets/logo.png';
</script>

<style scoped lang="less">
.back {
	padding: 0 0 20px;
	color: rgb(var(--arcoblue-6));
	font-size: 14px;
	cursor: pointer;
}

.chat {
	height: 400px;
	box-shadow: 0 0 10px rgb(0 0 0 / 10%);
}
</style>
