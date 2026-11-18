<template>
  <div class="frf" :class="{ 'is-nested': nested }">
    <div v-for="(rule, key) in rules" :key="key" class="frf-item">
      <div class="frf-label">
        <span v-if="rule.required" class="frf-required">*</span>
        <span class="frf-name">{{ key }}</span>
        <span class="frf-type">{{ typeLabel(rule) }}</span>
      </div>

      <!-- 嵌套对象：递归渲染下级字段 -->
      <FieldRuleForm
        v-if="rule.type === 'object' && rule.fields"
        :rules="rule.fields"
        :model-value="childOf(key)"
        :errors="errors"
        :path="pathOf(key)"
        nested
        @update:model-value="set(key, $event)"
      />
      <ElSelect
        v-else-if="rule.enum?.length"
        :model-value="modelValue[key]"
        clearable
        placeholder="请选择"
        @update:model-value="set(key, $event)"
      >
        <ElOption v-for="o in rule.enum" :key="String(o)" :label="String(o)" :value="o" />
      </ElSelect>
      <ElInputNumber
        v-else-if="rule.type === 'number' || rule.type === 'integer'"
        :model-value="modelValue[key] ?? undefined"
        :min="rule.min"
        :max="rule.max"
        :precision="rule.type === 'integer' ? 0 : undefined"
        controls-position="right"
        placeholder="不填则不传"
        class="frf-number"
        @update:model-value="set(key, $event ?? undefined)"
      />
      <ElSelect
        v-else-if="rule.type === 'boolean'"
        :model-value="modelValue[key]"
        clearable
        placeholder="不填则不传"
        @update:model-value="set(key, $event)"
      >
        <ElOption label="true" :value="true" />
        <ElOption label="false" :value="false" />
      </ElSelect>
      <!-- 数组、无字段声明的对象、any：按 JSON 输入 -->
      <ElInput
        v-else-if="rule.type === 'array' || rule.type === 'object' || rule.type === 'any'"
        :model-value="modelValue[key] ?? ''"
        type="textarea"
        :rows="2"
        :placeholder="rule.type === 'array' ? 'JSON 数组，如 [1, 2]' : 'JSON，如 {&quot;a&quot;: 1}'"
        class="frf-mono"
        @update:model-value="set(key, $event)"
      />
      <ElInput
        v-else
        :model-value="modelValue[key] ?? ''"
        :maxlength="rule.maxLen"
        placeholder="不填则不传"
        @update:model-value="set(key, $event)"
      />

      <div v-if="errors[pathOf(key)]" class="frf-error">{{ errors[pathOf(key)] }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { FieldRule } from '../types/dsl'

  // 按字段规则（FieldRule）渲染入参表单；值为原始输入（JSON 类字段为文本），由 buildFieldValues 转换与校验
  defineOptions({ name: 'FieldRuleForm' })

  const props = withDefaults(
    defineProps<{
      rules: Record<string, FieldRule>
      modelValue: Record<string, any>
      /** 字段路径 → 错误信息 */
      errors?: Record<string, string>
      /** 当前层级路径前缀 */
      path?: string
      nested?: boolean
    }>(),
    { errors: () => ({}), path: '', nested: false }
  )

  const emit = defineEmits<{ 'update:modelValue': [value: Record<string, any>] }>()

  const TYPE_LABEL: Record<string, string> = {
    string: '字符串',
    number: '数字',
    integer: '整数',
    boolean: '布尔',
    object: '对象',
    array: '数组',
    any: '任意'
  }

  function typeLabel(r: FieldRule): string {
    return TYPE_LABEL[r.type || 'any'] || r.type || ''
  }

  function pathOf(key: string): string {
    return props.path ? `${props.path}.${key}` : key
  }

  function childOf(key: string): Record<string, any> {
    const v = props.modelValue[key]
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
  }

  function set(key: string, v: any) {
    emit('update:modelValue', { ...props.modelValue, [key]: v })
  }
</script>

<style scoped lang="scss">
  .frf {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;

    &.is-nested {
      padding: 8px 0 8px 12px;
      border-left: 2px solid var(--el-border-color-lighter);
    }
  }

  .frf-label {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 4px;
    font-size: 13px;
    line-height: 18px;
  }

  .frf-required {
    color: var(--el-color-danger);
  }

  .frf-name {
    font-family: Menlo, Monaco, Consolas, monospace;
    font-weight: 500;
  }

  .frf-type {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .frf-number {
    width: 100%;
  }

  .frf-mono :deep(textarea) {
    font-family: Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
  }

  .frf-error {
    margin-top: 2px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--el-color-danger);
  }
</style>
