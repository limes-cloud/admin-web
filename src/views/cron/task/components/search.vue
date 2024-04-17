<template>
	<a-row v-permission="'cron:task:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="8">
						<a-form-item field="group_id" label="任务分组">
							<a-select
								v-model="form.group_id"
								placeholder="请选择任务分组"
								:scrollbar="true"
								:options="groups"
								:field-names="{ value: 'id', label: 'name' }"
								allow-clear
							/>
						</a-form-item>
					</a-col>

					<a-col :span="8">
						<a-form-item field="name" label="任务名称">
							<a-input v-model="form.name" allow-clear placeholder="请输入任务名称" />
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
import { PageTaskReq } from '@/api/cron/types/task';
import { CascaderOption } from '@arco-design/web-vue/es/cascader/interface';
import { ref } from 'vue';

defineProps<{
	groups: CascaderOption[];
}>();

const form = ref<PageTaskReq>({} as PageTaskReq);
const emit = defineEmits(['search']);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as PageTaskReq;
};
</script>
