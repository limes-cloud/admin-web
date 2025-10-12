<template>
	<div class="sql-condition-builder">
		<div class="logic-selector">
			<a-space>
				<a-select v-model="value.logic">
					<a-option value="AND">AND</a-option>
					<a-option value="OR">OR</a-option>
				</a-select>

				<div v-if="pindex != undefined" class="delete-btn" @click="emit('delete', pindex)">
					<icon-delete />
				</div>
			</a-space>
		</div>

		<div class="conditions-container" v-if="value">
			<!-- 条件组渲染 -->
			<template v-for="index in value.groups.length" :key="'group-' + index">
				<SqlConditionBuilder
					v-model="value.groups[index - 1]"
					:fields="fields"
					:pindex="index - 1"
					class="nested-group"
					@delete="handleDeleteRoot(index - 1)"
				/>
			</template>

			<!-- 条件行渲染 -->
			<div v-for="(condition, index) in value.conditions" :key="'condition-' + index" class="condition-row">
				<a-select v-model="condition.field" placeholder="选择字段">
					<a-option v-for="field in fields" :key="field.keyword" :value="field.keyword">
						{{ field.name }}
					</a-option>
				</a-select>

				<a-select v-model="condition.operator" @change="handleSelect(condition)">
					<a-option v-for="op in operators" :key="op.value" :value="op.value">
						{{ op.label }}
					</a-option>
				</a-select>

				<a-input v-if="hasInput(condition.operator)" v-model="condition.value" type="text" placeholder="输入值" />

				<a-input-tag v-if="hasArrar(condition.operator)" v-model="condition.value" placeholder="输入值" allow-clear />

				<div class="delete-btn" @click="value.conditions.splice(index, 1)">
					<icon-delete />
				</div>
			</div>

			<div class="actions">
				<a-space>
					<a-button
						status="normal"
						@click="
							value.conditions.push({
								field: '',
								operator: '=',
								value: ''
							})
						"
					>
						<template #icon>
							<icon-plus />
						</template>
						添加条件
					</a-button>
					<a-button
						status="normal"
						@click="
							value.groups.push({
								logic: 'AND',
								conditions: [],
								groups: []
							})
						"
					>
						<template #icon>
							<icon-menu />
						</template>
						添加条件组
					</a-button>
				</a-space>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Condition {
	field: string;
	operator: string;
	value: any;
}

interface Field {
	keyword: string;
	name: string;
}

interface ConditionGroup {
	logic: 'AND' | 'OR';
	conditions: Condition[];
	groups: ConditionGroup[];
}

const props = defineProps<{
	modelValue: ConditionGroup;
	fields: Field[];
	pindex?: number;
}>();

const emit = defineEmits(['update:modelValue', 'delete']);

const operators = [
	{ label: '等于', value: '=' },
	{ label: '不等于', value: '!=' },
	{ label: '大于', value: '>' },
	{ label: '小于', value: '<' },
	{ label: '大于等于', value: '>=' },
	{ label: '小于等于', value: '<=' },
	{ label: '包含', value: 'LIKE' },
	{ label: '不包含', value: 'NOT LIKE' },
	{ label: '为空', value: 'IS NULL' },
	{ label: '不为空', value: 'IS NOT NULL' },
	{ label: '在...中', value: 'IN' },
	{ label: '不在...中', value: 'NOT IN' }
];

const hasInput = (oper: string) => {
	return !['IS NULL', 'IS NOT NULL'].includes(oper) && !['IN', 'NOT IN'].includes(oper);
};

const hasArrar = (oper: string) => {
	return ['IN', 'NOT IN'].includes(oper);
};

const handleSelect = (condition: Condition) => {
	if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
		condition.value = [];
	} else {
		condition.value = '';
	}
};

const value = computed({
	get: () => props.modelValue,
	set: (val) => emit('update:modelValue', val)
});

// 初始化默认值
// if (!value.value) {
// 	value.value = {
// 		logic: 'AND',
// 		conditions: [],
// 		groups: []
// 	};
// }

const handleDeleteRoot = (index: number) => {
	value.value.groups.splice(index, 1);
};

const validate = () => {
	return validateHander(value.value);
};

// validate 遍历当前结构，判断是否存在空值，存在则返回false

const validateHander = (val: ConditionGroup) => {
	// 遍历当前结构，判断是否存在空值，存在则返回false
	if (val.conditions.length === 0) {
		return false;
	}
	if (val.conditions.some((condition) => !condition.field || !condition.operator || !condition.value)) {
		return false;
	}
	for (const group of val.groups) {
		if (!validateHander(group)) {
			return false;
		}
	}
	return true;
};

defineExpose({ validate });
</script>

<style scoped>
.sql-condition-builder {
	width: 100%;
	padding: 12px;
	font-family: -apple-system, BlinkMacSystemFont, sans-serif;
	border: 1px solid #eee;
	border-radius: 4px;
}

.logic-selector {
	margin-bottom: 12px;
}

.conditions-container {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.condition-row,
.condition-group {
	display: flex;
	gap: 8px;
	align-items: center;
}

.condition-group {
	flex-direction: column;
	padding: 12px;
	background: #fafafa;
	border: 1px solid #e8e8e8;
	border-radius: 4px;
}

.delete-btn {
	cursor: pointer;
}
</style>
