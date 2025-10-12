<template>
	<a-row v-permission="'manager:entity:query'">
		<a-space align="end" fill>
			<a-input style="flex: 1" v-model="form.name" @change="handleSearch" allow-clear placeholder="请输入实体标识" />

			<a-button type="primary" @click="emit('add')">
				<template #icon>
					<icon-plus />
				</template>
			</a-button>
			<a-button type="primary" status="success" @click="emit('load')">
				<template #icon>
					<icon-import />
				</template>
			</a-button>
		</a-space>
	</a-row>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const form = ref({
	name: ''
});
const emit = defineEmits(['search', 'add', 'load']);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = { name: '' };
};
</script>
