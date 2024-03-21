<template>
	<a-drawer v-model:visible="visible" :title="isAdd ? '新建' : '修改'" width="380px" @cancel="visible = false" @before-ok="handleSubmit">
		<a-form ref="formRef" :model="form" label-align="left" layout="horizontal" auto-label-width>
			<a-form-item
				field="keyword"
				label="对象标识"
				:rules="[
					{
						required: true,
						message: '对象标识是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.keyword" allow-clear placeholder="请输入对象标识" />
			</a-form-item>

			<a-form-item
				field="name"
				label="对象名称"
				:rules="[
					{
						required: true,
						message: '对象名称是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.name" allow-clear placeholder="请输入对象名称" />
			</a-form-item>

			<a-form-item
				field="api"
				label="请求接口"
				:rules="[
					{
						required: true,
						message: '来源接口是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.api" allow-clear placeholder="请输入来源接口">
					<template #append>
						<a-tree-select
							:data="(menus as TreeNodeData[])"
							placeholder="请选择来源接口"
							style="width: 100%"
							:disable-filter="false"
							:selectable="handleMenuStatus"
							:field-names="{
								key: 'id',
								icon: '_icon' // 这里必须改一下名字，不然会加载icon失败
							}"
							@change="handleSelectMenu"
						>
							<template #trigger>
								<span class="choose-menu-btn">
									<icon-menu-fold />
									选择
								</span>
							</template>
							<template #tree-slot-icon="{ node }">
								<icon-font-colors v-if="node.type === 'A' || node.type === 'BA'" />
								<icon-menu-fold v-else />
							</template>
						</a-tree-select>
					</template>
				</a-input>
			</a-form-item>

			<a-form-item
				field="method"
				label="接口方法"
				:rules="[
					{
						required: true,
						message: '接口方法是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-select v-model="form.method" allow-clear placeholder="请选择接口方法">
					<a-option value="GET">GET请求</a-option>
					<a-option value="POST">POST请求</a-option>
				</a-select>
			</a-form-item>

			<a-form-item field="params" label="接口参数">
				<a-textarea v-model="form.params" allow-clear placeholder="请输入接口参数" />
			</a-form-item>

			<a-form-item
				field="label"
				label="标签字段"
				:rules="[
					{
						required: true,
						message: '标签字段是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.label" allow-clear placeholder="请输入标签字段" />
			</a-form-item>

			<a-form-item
				field="value"
				label="值字段"
				:rules="[
					{
						required: true,
						message: '值字段是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-input v-model="form.value" allow-clear placeholder="请输入值字段" />
			</a-form-item>

			<a-form-item
				field="description"
				label="对象描述"
				:rules="[
					{
						required: true,
						message: '对象描述是必填项'
					}
				]"
				:validate-trigger="['change', 'input']"
			>
				<a-textarea v-model="form.description" allow-clear placeholder="请输入对象描述" />
			</a-form-item>
		</a-form>
	</a-drawer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { ObjectDef } from '@/api/manager/types/object';
import { TreeNodeData } from '@arco-design/web-vue/es/tree/interface';
import { Menu } from '@/api/manager/types/menu';

const formRef = ref();
const visible = ref(false);
const isAdd = ref(false);

const props = defineProps<{
	data: ObjectDef;
	menus: Menu[];
}>();

const form = ref({} as ObjectDef);
const emit = defineEmits(['add', 'update']);

watch(
	() => props.data,
	(val) => {
		if (!val || !Object.keys(val).length) return;
		form.value = val;
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

// const handleMenuFilter = (key: string, node: any) => {
// 	return (!node.children || !node.children.length) && (node.type !== 'BA' || node.type !== 'A');
// };

const handleMenuStatus = (node: any) => {
	return (node.type === 'A' || node.type === 'BA') && (node.method === 'GET' || node.method === 'POST');
};

const findMenuById = (menus: Menu[], mid: number): Menu | unknown => {
	let menu: Menu | unknown = null;
	menus.forEach((item) => {
		if (item.id === mid) {
			menu = item;
		}
		if (item.children) {
			const result = findMenuById(item.children, mid);
			if (result) {
				menu = result;
			}
		}
	});
	return menu;
};

const handleSelectMenu = (id: any) => {
	const menu = findMenuById(props.menus, id as number) as Menu;
	if (menu) {
		form.value.api = menu.api;
		form.value.method = menu.method;
	}
};
</script>

<style lang="less" scoped>
.choose-menu-btn {
	cursor: pointer;
}
</style>
