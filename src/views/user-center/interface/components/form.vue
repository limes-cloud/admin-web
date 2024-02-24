<template>
	<a-drawer
		v-model:visible="visible"
		:title="isAdd ? '新建' : '修改'"
		width="380px"
		unmount-on-close
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				v-if="form.type != 'R'"
				field="parent_id"
				label="父接口"
				:rules="[
					{
						required: true,
						message: '父接口是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-cascader
					v-model="form.parent_id"
					check-strictly
					:options="parentInterfaces()"
					:field-names="{ value: 'id', label: 'title' }"
					placeholder="请选择父接口"
					allow-search
				/>
			</a-form-item>

			<a-form-item
				field="title"
				label="标题"
				:rules="[
					{
						required: true,
						message: '标题是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.title" placeholder="请输入接口标题" allow-clear />
			</a-form-item>

			<a-form-item
				field="type"
				label="接口类型"
				:rules="[
					{
						required: true,
						message: '接口类型是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select v-model="form.type" :options="menuTypes" placeholder="请选择接口类型" />
			</a-form-item>

			<template v-if="form.type === 'A'">
				<a-form-item
					field="method"
					label="请求方法"
					:validate-trigger="['change', 'input']"
					:rules="[
						{
							required: true,
							message: '请求方法是必填项'
						}
					]"
				>
					<a-radio-group v-model="form.method">
						<a-radio value="GET">GET</a-radio>
						<a-radio value="POST">POST</a-radio>
						<a-radio value="PUT">PUT</a-radio>
						<a-radio value="DELETE">DELETE</a-radio>
					</a-radio-group>
				</a-form-item>

				<a-form-item
					field="path"
					label="接口路径"
					allow-clear
					:rules="[
						{
							required: true,
							message: '接口路径是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-input v-model="form.path" placeholder="请输入接口路径" allow-clear />
				</a-form-item>

				<a-form-item field="description" label="应用描述">
					<a-textarea v-model="form.description" placeholder="请输入应用描述" allow-clear />
				</a-form-item>
			</template>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
import { TableData } from '@arco-design/web-vue';
import { AppInterface } from '@/api/user-center/types/app-interface';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);
const menuTypes = computed<SelectOptionData[]>(() => [
	{
		label: '接口',
		value: 'A'
	},
	{
		label: '分组',
		value: 'G'
	}
]);

const props = defineProps<{
	interfaces?: TableData[];
	data: AppInterface;
}>();

const form = ref({} as AppInterface);
const emit = defineEmits(['add', 'update']);

watch(
	() => props.data,
	(val) => {
		form.value = val;
	}
);

const parentInterfaces = () => {
	return [{ id: 0, title: '根菜单', children: props.interfaces }];
};

const showAddDrawer = () => {
	visible.value = true;
	isAdd.value = true;
};

const showUpdateDrawer = () => {
	visible.value = true;
	isAdd.value = false;
};

const closeDrawer = () => {
	visible.value = false;
};

defineExpose({ showAddDrawer, showUpdateDrawer, closeDrawer });

const handleSubmit = async () => {
	const isError = await formRef.value.validate();
	if (isError) {
		return false;
	}

	if (isAdd.value) {
		emit('add', { ...form.value });
	} else {
		emit('update', { ...form.value });
	}
	return true;
};
</script>
