<template>
	<a-row v-permission="'manager:dictionary:query'">
		<a-space align="end" fill>
			<a-input style="flex: 1" v-model="form.keyword" @change="handleSearch" allow-clear placeholder="请输入字典标识" />

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
	name: '',
	keyword: ''
});
const emit = defineEmits(['search', 'add']);

const handleSearch = () => {
	emit('search', form.value);
};

const reset = () => {
	form.value = { name: '', keyword: '' };
};
</script>
