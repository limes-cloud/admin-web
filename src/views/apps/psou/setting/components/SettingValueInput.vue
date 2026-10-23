<template>
  <div class="setting-value-input">
    <ElInput
      v-if="kind === 'string' || kind === 'image'"
      :model-value="modelValue"
      :disabled="disabled"
      :placeholder="placeholder || (kind === 'image' ? '请输入图片 URL' : '请输入配置取值')"
      :maxlength="maxLength"
      clearable
      @update:model-value="emitValue"
    />

    <ElInput
      v-else-if="kind === 'text'"
      :model-value="modelValue"
      type="textarea"
      :rows="rows"
      :disabled="disabled"
      :placeholder="placeholder || '请输入配置取值'"
      :maxlength="maxLength"
      show-word-limit
      @update:model-value="emitValue"
    />

    <ElInputNumber
      v-else-if="kind === 'int' || kind === 'float'"
      :model-value="numberValue"
      :min="extra.min"
      :max="extra.max"
      :step="kind === 'int' ? 1 : 0.1"
      :precision="kind === 'int' ? 0 : 2"
      :disabled="disabled"
      align="left"
      controls-position="right"
      style="width: 100%"
      @update:model-value="emitNumber"
    />

    <ElSelect
      v-else-if="kind === 'bool'"
      :model-value="modelValue"
      :disabled="disabled"
      placeholder="请选择"
      clearable
      style="width: 100%"
      @update:model-value="emitValue"
    >
      <ElOption label="是" value="true" />
      <ElOption label="否" value="false" />
    </ElSelect>

    <ElSelect
      v-else-if="kind === 'enum' && optionList.length > 0"
      :model-value="modelValue"
      :disabled="disabled"
      placeholder="请选择"
      clearable
      style="width: 100%"
      @update:model-value="emitValue"
    >
      <ElOption v-for="item in optionList" :key="item.value" :label="item.label" :value="item.value" />
    </ElSelect>

    <ElSelect
      v-else-if="kind === 'array'"
      :model-value="arrayValue"
      multiple
      filterable
      :allow-create="optionList.length === 0"
      default-first-option
      :disabled="disabled"
      placeholder="输入后回车，可多选"
      style="width: 100%"
      @update:model-value="emitArray"
    >
      <ElOption v-for="item in optionList" :key="item.value" :label="item.label" :value="item.value" />
    </ElSelect>

    <ElInput
      v-else-if="kind === 'object' || kind === 'kv'"
      :model-value="modelValue"
      type="textarea"
      :rows="6"
      :disabled="disabled"
      :placeholder="kind === 'kv' ? 'JSON 对象，值只能是字符串/数字/布尔/null' : 'JSON 对象'"
      @update:model-value="emitValue"
    />

    <ElInput
      v-else
      :model-value="modelValue"
      :disabled="disabled"
      placeholder="请输入配置取值"
      @update:model-value="emitValue"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  defineOptions({ name: 'PsouSettingValueInput' })

  const props = withDefaults(
    defineProps<{
      modelValue: string
      type: string
      extra?: string
      disabled?: boolean
    }>(),
    {
      extra: '',
      disabled: false
    }
  )

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  interface ExtraOption {
    label?: string
    value: unknown
  }

  interface ExtraConfig {
    options?: ExtraOption[]
    min?: number
    max?: number
    rows?: number
    maxLength?: number
    placeholder?: string
    unit?: string
  }

  const kind = computed(() => props.type || 'string')

  const extra = computed<ExtraConfig>(() => {
    if (!props.extra) return {}
    try {
      const value = JSON.parse(props.extra)
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    } catch {
      return {}
    }
  })

  const optionList = computed(() =>
    Array.isArray(extra.value.options)
      ? extra.value.options
          .filter((item) => item && item.value !== undefined && item.value !== null)
          .map((item) => ({
            label: item.label || String(item.value),
            value: String(item.value)
          }))
      : []
  )

  const placeholder = computed(() => extra.value.placeholder || '')
  const maxLength = computed(() =>
    extra.value.maxLength && extra.value.maxLength > 0 ? extra.value.maxLength : undefined
  )
  const rows = computed(() => (extra.value.rows && extra.value.rows > 0 ? extra.value.rows : 3))

  const numberValue = computed(() => {
    if (props.modelValue === '' || props.modelValue === null || props.modelValue === undefined) return undefined
    const value = Number(props.modelValue)
    return Number.isFinite(value) ? value : undefined
  })

  const arrayValue = computed<string[]>(() => {
    if (!props.modelValue) return []
    try {
      const value = JSON.parse(props.modelValue)
      return Array.isArray(value) ? value.map((item) => String(item)) : []
    } catch {
      return []
    }
  })

  const emitValue = (value: string | number | undefined) => {
    emit('update:modelValue', value === undefined || value === null ? '' : String(value))
  }

  const emitNumber = (value: number | undefined | null) => {
    emit('update:modelValue', value === undefined || value === null ? '' : String(value))
  }

  const emitArray = (value: string[]) => {
    emit('update:modelValue', JSON.stringify(value || []))
  }
</script>

<style scoped>
  .setting-value-input {
    width: 100%;
  }
</style>
