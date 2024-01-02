<template>
	<div class="form-edit">
		<Components @create="handleCreateComponent" />
		<Form :list="components" @choose="handleChoose"></Form>
		<Tool :component="curComponent" :show-edit="showToolEdit" />
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Components from './components/components.vue';
import Form from './components/form.vue';
import Tool from './components/tool.vue';
import { Component } from './lib/types';

const props = defineProps<{
	defaultComponents?: Component[];
}>();

const components = ref<Component[]>([]);
const curComponent = ref<Component>();
const showToolEdit = ref(false);

if (props.defaultComponents) {
	components.value = [...props.defaultComponents];
}

const handleCreateComponent = (val: Component) => {
	components.value.push(val);
};

const handleChoose = (com: Component) => {
	curComponent.value = com;
	showToolEdit.value = true;
};

const getComponents = () => {
	return components.value;
};

defineExpose({ getComponents });
</script>

<style lang="less" scoped>
.form-edit {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	height: 100%;
}
</style>
