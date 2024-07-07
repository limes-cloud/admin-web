<template>
	<a-space direction="vertical" fill>
		<a-table
			v-permission="'partyaffairs:video:content:query'"
			row-key="id"
			:loading="loading"
			:columns="columns"
			:data="data"
			:bordered="false"
			:pagination="false"
			:size="size"
		>
			<template #classify="{ record }">
				{{ record.classify.name }}
			</template>
			<template #url="{ record }">
				<video preload="metadata" :style="{ width: '100px', height: '60px' }" @click="handlePlayVideo(record)">
					<source :src="$rurl(record.resource?.url)" />
				</video>
			</template>

			<template #createdAt="{ record }">
				{{ $formatTime(record.created_at) }}
			</template>
			<template #updatedAt="{ record }">
				{{ $formatTime(record.updated_at) }}
			</template>

			<template #operations="{ record }">
				<a-space class="cursor-pointer">
					<a-tag v-permission="'partyaffairs:video:content:update'" color="orangered" @click="emit('update', record)">
						<template #icon><icon-edit /></template>
						修改
					</a-tag>

					<a-popconfirm content="您确认删除此内容？" type="warning" @ok="emit('delete', record.id)">
						<a-tag v-permission="'partyaffairs:video:content:delete'" color="red">
							<template #icon><icon-delete /></template>
							删除
						</a-tag>
					</a-popconfirm>
				</a-space>
			</template>
		</a-table>
		<a-pagination
			:total="total"
			:current="page.page"
			:page-size="page.pageSize"
			show-total
			show-jumper
			show-page-size
			@change="pageChange"
			@page-size-change="pageSizeChange"
		/>
	</a-space>
	<a-modal
		v-model:visible="playVideoVisible"
		width="480px"
		:modal-style="{ overflow: 'hidden' }"
		:hide-cancel="true"
		:footer="false"
		:body-style="{ padding: 0, lineHeight: '0px !important' }"
		unmount-on-close
	>
		<template #title>
			<div>{{ curFile.name }}</div>
		</template>
		<video v-if="playVideoVisible" class="video-model" autoplay controls preload="metadata">
			<source :src="$rurl(curFile.url)" />
			当前浏览器不支持 video直接播放
		</video>
	</a-modal>
</template>

<script lang="ts" setup>
import { VideoContent } from '@/api/partyaffairs/types/video';
import { TableSize, TableColumn, Pagination, Resource } from '@/types/global';
import { TableData } from '@arco-design/web-vue/es/table/interface';
import { watch, ref } from 'vue';

const emit = defineEmits(['delete', 'update', 'add', 'pageChange', 'disable', 'enable', 'offline', 'resetPassword']);

const props = defineProps<{
	columns: TableColumn[];
	loading: boolean;
	data?: TableData[];
	size: TableSize;
	pagination: Pagination;
	total: number;
}>();

const page = ref({
	page: 1,
	pageSize: 10
});

const playVideoVisible = ref(false);
const curFile = ref<Resource>({} as Resource);

watch(
	() => props.pagination,
	(val) => {
		page.value = { ...val };
	},
	{ deep: true, immediate: true }
);

const pageChange = (current: number) => {
	page.value.page = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};

const handlePlayVideo = (content: VideoContent) => {
	curFile.value = content.resource;
	playVideoVisible.value = true;
};
</script>

<style lang="less" scoped>
.video-model {
	width: 100%;
}
</style>
