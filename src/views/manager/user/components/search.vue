<template>
	<a-row v-permission="'manager:user:query'">
		<a-col :flex="1">
			<a-form :model="form" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }" label-align="left" auto-label-width>
				<a-row :gutter="16">
					<a-col :span="8">
						<a-form-item field="team_id" label="用户角色">
							<a-cascader
								v-model="form.role_id"
								check-strictly
								allow-clear
								:options="[roles]"
								:field-names="{ value: 'id', label: 'name' }"
								placeholder="请选择用户角色"
								allow-search
							/>
						</a-form-item>
					</a-col>

					<a-col :span="8">
						<a-form-item field="department_id" label="用户部门">
							<a-cascader
								v-model="form.department_id"
								allow-clear
								check-strictly
								:options="departments"
								:field-names="{ value: 'id', label: 'name' }"
								placeholder="请选择用户部门"
								allow-search
							/>
						</a-form-item>
					</a-col>

					<a-col :span="8">
						<a-form-item field="name" label="用户姓名">
							<a-input v-model="form.name" allow-clear placeholder="请输入用户姓名" />
						</a-form-item>
					</a-col>

					<a-col :span="8">
						<a-form-item field="phone" label="电话/邮箱">
							<a-input v-model="form.username" allow-clear placeholder="请输入用户电话/邮箱" />
						</a-form-item>
					</a-col>

					<a-col :span="8">
						<a-form-item field="status" label="用户状态">
							<a-select v-model="form.status" allow-search allow-clear placeholder="用户状态">
								<a-option :value="true">启用</a-option>
								<a-option :value="false">禁用</a-option>
							</a-select>
						</a-form-item>
					</a-col>

					<a-col :span="8">
						<a-form-item field="createdTime" label="创建时间">
							<a-range-picker v-model="form.time" value-format="timestamp" style="width: 100%" allow-clear />
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-col>
		<a-divider style="height: 84px" direction="vertical" />
		<a-col :flex="'86px'" style="text-align: right">
			<a-space direction="vertical" :size="18">
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
import { PageUserReq } from '@/api/manager/types/user';
import { CascaderOption } from '@arco-design/web-vue/es/cascader/interface';
import { ref } from 'vue';

defineProps<{
	departments: CascaderOption[];
	roles: CascaderOption;
}>();

const form = ref<PageUserReq>({} as PageUserReq);
const emit = defineEmits(['search']);

const handleSearch = () => {
	form.value.start_time = undefined;
	form.value.start_time = undefined;
	if (form.value.time?.length) {
		const start = Number(form.value.time[0] / 1000);
		const end = Number(form.value.time[1] / 1000);
		form.value.start_time = start;
		form.value.end_time = end;
	}
	emit('search', form.value);
};

const reset = () => {
	form.value = {} as PageUserReq;
};
</script>
