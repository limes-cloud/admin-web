<template>
	<a-row v-permission="'partyaffairs:video:content:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="8">
						<a-form-item field="classify_id" label="视频分类">
							<a-select
								v-model="form.classify_id"
								placeholder="请选择视频分类"
								:max-tag-count="2"
								:scrollbar="true"
								:options="innerClassifys"
								allow-search
								:field-names="{ value: 'id', label: 'name' }"
								@search="search"
							></a-select>
						</a-form-item>
					</a-col>

					<a-col :span="8">
						<a-form-item field="title" label="视频标题">
							<a-input v-model="form.title" allow-clear placeholder="请输入视频标题" />
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-col>
		<a-col :flex="'220px'" style="text-align: right">
			<a-space :size="18">
				<a-button type="primary" @click="handleSearch">
					<template #icon>
						<icon-search />
					</template>
					搜索
				</a-button>
				<a-button @click="reset">
					<template #icon>
						<icon-refresh />
					</template>
					重置
				</a-button>
			</a-space>
		</a-col>
	</a-row>
</template>

<script lang="ts" setup>
import { PageVideoContentReq, VideoClassify } from '@/api/partyaffairs/types/video';
import { pageVideoClassify } from '@/api/partyaffairs/video';
import { onMounted, ref } from 'vue';

const form = ref<PageVideoContentReq>({} as PageVideoContentReq);
const emit = defineEmits(['search']);
const innerClassifys = ref<VideoClassify[]>([]);
const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as PageVideoContentReq;
};

const search = async (val?: string) => {
	const { data } = await pageVideoClassify({ page: 1, page_size: 10, name: val });
	const { list } = data;
	if (!list) {
		return;
	}

	const searchd: VideoClassify[] = [];
	list.forEach((item) => {
		if (form.value.classify_id !== item.id) {
			searchd.push(item);
		}
	});

	innerClassifys.value = searchd;
};

onMounted(() => {
	search();
});
</script>
