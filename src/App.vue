<template>
	<div v-if="loading" class="loadingBox">
		<a-spin dot :tip="(title as string)" />
	</div>
	<router-view />
</template>

<script lang="ts" setup>
import { useAppStore } from '@/store';
import { computed } from 'vue';

const appStore = useAppStore();
const loading = computed(() => appStore.isLoading);
const title = computed(() => appStore.loadingTitle);
</script>

//
<style lang="less" scoped>
// .loadingBox {
// 	position: fixed;
// 	top: 0;
// 	left: 0;
// 	z-index: 1000000;
// 	background-color: rgba(0, 0, 0, 0.4);
// 	width: 100%;
// 	height: 100%;
// 	display: flex;
// 	align-items: center;
// 	justify-content: center;
// 	text-align: center;
// 	overflow: hidden;
// }
//
</style>

<style lang="less">
.arco-modal-simple {
	padding: 20px !important;
}

.navbar {
	.arco-menu-icon {
		margin-right: 5px !important;
	}
}

.i-dialog-footer {
	border-top: 1px solid #f2f2f2 !important;

	.arco-btn {
		margin-right: 15px;
	}
}

.arco-tree-node-selected .arco-tree-node-title {
	background-color: #f2f2f2;
}

.file-font-red {
	color: #f53f3f !important;
}

.file-font-blue {
	color: #499dff !important;
}

.arco-table-th,
.arco-table-td {
	color: rgb(var(--gray-8)) !important;
}

.arco-tabs-nav-type-capsule {
	justify-content: flex-start !important;
}

.arco-tabs-nav-type-capsule .arco-tabs-nav-tab:not(.arco-tabs-nav-tab-scroll) {
	justify-content: flex-start !important;
}

.cursor-pointer {
	cursor: pointer;
}

.arco-table-td-content {
	display: flex !important;
}

.container {
	padding: 0 20px 20px;

	:deep(.arco-list-content) {
		overflow-x: hidden;
	}

	:deep(.arco-card-meta-title) {
		font-size: 14px;
	}
}

.model-footer {
	display: flex;
	justify-content: space-between;
	padding: 15px;
}

.arco-upload-list-type-picture-card {
	width: 100%;
}
</style>
