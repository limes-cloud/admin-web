<template>
  <div class="field-rule-editor" :class="{ 'is-nested': depth > 0 }">
    <div v-for="row in rows" :key="row.uid" class="fr-row">
      <div class="fr-line">
        <ElInput
          :model-value="nameDrafts[row.uid] ?? row.name"
          size="small"
          placeholder="字段名"
          class="fr-name"
          @update:model-value="(v: string) => (nameDrafts[row.uid] = v)"
          @change="(v: string) => commitName(row.uid, row.name, v)"
        />
        <ElSelect
          :model-value="row.rule.type || 'any'"
          size="small"
          class="fr-type"
          @update:model-value="(v: FieldType) => setField(row.name, 'type', v === 'any' ? undefined : v)"
        >
          <ElOption v-for="t in FIELD_TYPES" :key="t" :label="t" :value="t" />
        </ElSelect>
        <ElCheckbox
          :model-value="!!row.rule.required"
          size="small"
          @update:model-value="(v: any) => setField(row.name, 'required', v ? true : undefined)"
        >
          必填
        </ElCheckbox>
        <ElPopover placement="left" :width="300" trigger="click">
          <template #reference>
            <ElButton size="small" text :type="hasConstraint(row.rule) ? 'primary' : 'default'">约束</ElButton>
          </template>
          <ElForm label-width="70px" size="small">
            <template v-if="isNumber(row.rule)">
              <ElFormItem label="最小值">
                <ElInputNumber
                  :model-value="row.rule.min"
                  controls-position="right"
                  @update:model-value="(v: any) => setField(row.name, 'min', num(v))"
                />
              </ElFormItem>
              <ElFormItem label="最大值">
                <ElInputNumber
                  :model-value="row.rule.max"
                  controls-position="right"
                  @update:model-value="(v: any) => setField(row.name, 'max', num(v))"
                />
              </ElFormItem>
            </template>
            <template v-if="isLength(row.rule)">
              <ElFormItem label="最小长度">
                <ElInputNumber
                  :model-value="row.rule.minLen"
                  :min="0"
                  controls-position="right"
                  @update:model-value="(v: any) => setField(row.name, 'minLen', num(v))"
                />
              </ElFormItem>
              <ElFormItem label="最大长度">
                <ElInputNumber
                  :model-value="row.rule.maxLen"
                  :min="0"
                  controls-position="right"
                  @update:model-value="(v: any) => setField(row.name, 'maxLen', num(v))"
                />
              </ElFormItem>
            </template>
            <ElFormItem v-if="row.rule.type === 'string' || !row.rule.type" label="正则">
              <ElInput
                :model-value="row.rule.pattern"
                @update:model-value="(v: string) => setField(row.name, 'pattern', v || undefined)"
              />
            </ElFormItem>
            <ElFormItem label="枚举">
              <JsonInput
                :model-value="row.rule.enum"
                :rows="2"
                placeholder='JSON 数组，如 ["a","b"]'
                @update:model-value="
                  (v: any) => setField(row.name, 'enum', Array.isArray(v) && v.length ? v : undefined)
                "
              />
            </ElFormItem>
          </ElForm>
        </ElPopover>
        <ElButton size="small" text type="danger" :icon="Delete" @click="remove(row.name)" />
      </div>
      <div v-if="row.rule.type === 'object'" class="fr-children">
        <FieldRuleEditor
          :model-value="row.rule.fields"
          :depth="depth + 1"
          @update:model-value="(v) => setField(row.name, 'fields', v)"
        />
      </div>
      <div v-if="row.rule.type === 'array'" class="fr-children">
        <div class="fr-line">
          <span class="fr-label">元素类型</span>
          <ElSelect
            :model-value="row.rule.items?.type || 'any'"
            size="small"
            class="fr-type"
            @update:model-value="(v: FieldType) => setItems(row.name, v)"
          >
            <ElOption v-for="t in FIELD_TYPES" :key="t" :label="t" :value="t" />
          </ElSelect>
        </div>
        <FieldRuleEditor
          v-if="row.rule.items?.type === 'object'"
          :model-value="row.rule.items?.fields"
          :depth="depth + 1"
          @update:model-value="(v) => setItemFields(row.name, v)"
        />
      </div>
    </div>
    <ElButton size="small" text type="primary" :icon="Plus" @click="add">添加字段</ElButton>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive } from 'vue'
  import { Delete, Plus } from '@element-plus/icons-vue'
  import JsonInput from './JsonInput.vue'
  import type { FieldRule, FieldType } from '../../types/dsl'
  import { FIELD_TYPES } from '../../utils/constants'

  defineOptions({ name: 'FieldRuleEditor' })

  const props = withDefaults(defineProps<{ modelValue?: Record<string, FieldRule>; depth?: number }>(), {
    modelValue: undefined,
    depth: 0
  })

  const emit = defineEmits<{ 'update:modelValue': [value: Record<string, FieldRule> | undefined] }>()

  const rows = computed(() =>
    Object.entries(props.modelValue || {}).map(([name, rule], i) => ({ uid: `${i}:${name}`, name, rule: rule || {} }))
  )

  /** 以新的有序条目输出；为空时输出 undefined（导出时省略） */
  function output(entries: [string, FieldRule][]) {
    emit('update:modelValue', entries.length ? Object.fromEntries(entries) : undefined)
  }

  function entries(): [string, FieldRule][] {
    return Object.entries(props.modelValue || {})
  }

  function add() {
    const names = new Set(Object.keys(props.modelValue || {}))
    let i = 1
    while (names.has(`field${i}`)) i++
    output([...entries(), [`field${i}`, { type: 'string' }]])
  }

  function remove(name: string) {
    output(entries().filter(([k]) => k !== name))
  }

  /**
   * 字段名输入中的草稿（行 uid → 文本）：字段名是对象键，每输入一个字符就改键会让行重建、输入框失焦，
   * 所以输入时只改草稿，失焦 / 回车时再重命名；不维护草稿时受控输入框会被重置回原值，无法输入
   */
  const nameDrafts = reactive<Record<string, string>>({})

  function commitName(uid: string, oldName: string, newName: string) {
    delete nameDrafts[uid]
    rename(oldName, newName)
  }

  function rename(oldName: string, newName: string) {
    const n = newName.trim()
    if (!n || n === oldName) return
    if (Object.prototype.hasOwnProperty.call(props.modelValue || {}, n)) {
      ElMessage.warning(`字段 ${n} 已存在`)
      return
    }
    output(entries().map(([k, v]) => (k === oldName ? [n, v] : [k, v])))
  }

  function setField<K extends keyof FieldRule>(name: string, key: K, value: FieldRule[K] | undefined) {
    output(
      entries().map(([k, v]) => {
        if (k !== name) return [k, v]
        const next: FieldRule = { ...v }
        if (value === undefined) delete next[key]
        else next[key] = value
        // 类型切换时清理不再适用的子结构
        if (key === 'type') {
          if (value !== 'object') delete next.fields
          if (value !== 'array') delete next.items
          if (value === 'array' && !next.items) next.items = {}
        }
        return [k, next]
      })
    )
  }

  function setItems(name: string, type: FieldType) {
    const cur = props.modelValue?.[name]?.items || {}
    const items: FieldRule = { ...cur, type: type === 'any' ? undefined : type }
    if (type !== 'object') delete items.fields
    if (items.type === undefined) delete items.type
    setField(name, 'items', items)
  }

  function setItemFields(name: string, fields: Record<string, FieldRule> | undefined) {
    const cur = props.modelValue?.[name]?.items || {}
    setField(name, 'items', { ...cur, fields })
  }

  const isNumber = (r: FieldRule) => r.type === 'number' || r.type === 'integer'
  const isLength = (r: FieldRule) => r.type === 'string' || r.type === 'array'
  const num = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)
  const hasConstraint = (r: FieldRule) =>
    [r.min, r.max, r.minLen, r.maxLen, r.pattern, r.enum].some((v) => v !== undefined && v !== '')
</script>

<style scoped lang="scss">
  .field-rule-editor {
    width: 100%;

    &.is-nested {
      padding-left: 12px;
      border-left: 2px solid var(--el-border-color-lighter);
    }
  }

  .fr-row {
    margin-bottom: 4px;
  }

  .fr-line {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .fr-name {
    flex: 1;
    min-width: 0;
  }

  .fr-type {
    width: 90px;
  }

  .fr-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .fr-children {
    margin: 4px 0 4px 8px;
  }
</style>
