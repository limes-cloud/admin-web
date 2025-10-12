<template>
	<a-row v-permission="'manager:entity:rule:query'">
		<a-space align="end" fill>
			<a-input style="flex: 1" v-model="form.name" @change="handleSearch" allow-clear placeholder="请输入规则标识" />
			<a-button type="primary" @click="emit('add')">
				<template #icon>
					<icon-plus />
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

const emit = defineEmits(['search', 'add']);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = { name: '' };
};
</script>
