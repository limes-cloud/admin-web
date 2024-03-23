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
				field="keyword"
				label="变量标识"
				:rules="[
					{
						required: true,
						message: '变量标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" :disabled="!isAdd" placeholder="请输入变量标识" allow-clear />
			</a-form-item>

			<a-form-item
				field="tag"
				label="变量标签"
				:rules="[
					{
						required: true,
						message: '变量标签是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.tag" placeholder="请输入变量标签" allow-clear />
			</a-form-item>

			<a-form-item
				field="fieldList"
				label="变量字段"
				:rules="[
					{
						required: true,
						message: '变量字段是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input-tag v-model="form.fieldList" placeholder="请输入变量字段" unique-value allow-clear />
			</a-form-item>

			<a-form-item
				field="private"
				label="变量类型"
				:rules="[
					{
						required: true,
						message: '变量类型是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-radio-group v-model="form.private">
					<a-radio :value="true">私有变量</a-radio>
					<a-radio :value="false">公共变量</a-radio>
				</a-radio-group>
			</a-form-item>

			<a-form-item
				v-if="form.private"
				field="private"
				label="所属服务"
				:rules="[
					{
						required: true,
						message: '所属服务是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select
					v-model="form.servers"
					placeholder="请选择变量所属服务"
					multiple
					:max-tag-count="2"
					:scrollbar="true"
					:options="servers"
					allow-search
					:field-names="{ value: 'id', label: 'name' }"
				></a-select>
				<!-- <a-select
					v-model="form.servers"
					placeholder="请选择变量所属服务"
					multiple
					:max-tag-count="2"
					:scrollbar="true"
					:options="innerServers"
					allow-search
					:field-names="{ value: 'id', label: 'name' }"
					@search="search"
					@focus="search('')"
				></a-select> -->
			</a-form-item>

			<a-form-item
				field="description"
				label="变量描述"
				:rules="[
					{
						required: true,
						message: '变量描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" placeholder="请输入变量描述" allow-clear />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { Resource } from '@/api/configure/types/resource';
import { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
import { ref, watch } from 'vue';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: Resource;
	servers: SelectOptionData[];
}>();

const form = ref({ ...props.data });
const emit = defineEmits(['add', 'update']);

watch(
	() => props.data,
	(val) => {
		form.value = val;
	},
	{ deep: true }
);

watch(
	() => props.servers,
	(val) => {
		val.forEach((item) => {
			if (!form.value.servers) form.value.servers = [];
			item.name = `${item.name}(${item.keyword})`;
			form.value.servers.push(item.id);
		});
	}
);

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
