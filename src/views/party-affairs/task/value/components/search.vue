<template>
	<a-row v-permission="'party-affairs:task:value:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="8">
						<a-form-item field="title" label="任务标题">
							<a-select
								v-model="form.task_id"
								placeholder="请选择任务"
								:scrollbar="true"
								:options="tasks"
								:field-names="{ value: 'id', label: 'title' }"
								@search="search"
								@change="change"
							></a-select>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-col>
		<!-- <a-col :flex="'220px'" style="text-align: right">
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
		</a-col> -->
	</a-row>
</template>

<script lang="ts" setup>
import { pageTask } from '@/api/party-affairs/task';
import { Task } from '@/api/party-affairs/types/task';
import { onMounted, ref } from 'vue';

const current = ref<Task>();
const tasks = ref<Task[]>([]);
const form = ref<{
	task_id?: number;
}>({});
const emit = defineEmits(['select']);

const search = async (val?: string) => {
	const { data } = await pageTask({ page: 1, page_size: 10, title: val });
	const { list } = data;
	if (!list) {
		return;
	}

	// 初始化
	const searchd: Task[] = [];
	list.forEach((item) => {
		searchd.push(item);
	});

	const selectd: Task[] = [];
	tasks.value.forEach((item) => {
		if (item.id === form.value.task_id) {
			selectd.push(item);
		}
	});

	tasks.value = searchd.concat(selectd);
};

const change = (val: any) => {
	tasks.value.forEach((item) => {
		if (item.id === val) {
			current.value = item;
		}
	});
	emit('select', val);
};

onMounted(() => {
	search();
});
</script>
