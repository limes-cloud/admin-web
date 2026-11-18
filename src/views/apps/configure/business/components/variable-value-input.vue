<template>
  <!-- 按变量类型渲染对应控件（业务变量值配置 / 系统配置页共用） -->
  <ElInputNumber
    v-if="type === 'int'"
    v-model="innerValue"
    :precision="0"
    :min="extra.min"
    :max="extra.max"
    :controls="false"
    style="width: 100%"
  />
  <ElInputNumber
    v-else-if="type === 'float'"
    v-model="innerValue"
    :min="extra.min"
    :max="extra.max"
    :controls="false"
    style="width: 100%"
  />
  <ElSwitch v-else-if="type === 'bool'" v-model="innerValue" active-text="是" inactive-text="否" />
  <ElSelect
    v-else-if="type === 'enum'"
    v-model="innerValue"
    :placeholder="extra.placeholder || '请选择'"
    clearable
    style="width: 100%"
  >
    <ElOption v-for="opt in extra.options || []" :key="opt.value" :label="opt.label || opt.value" :value="opt.value" />
  </ElSelect>
  <ElSelect
    v-else-if="type === 'array'"
    v-model="innerValue"
    multiple
    filterable
    allow-create
    :placeholder="extra.placeholder || '请选择或输入'"
    style="width: 100%"
  >
    <ElOption v-for="opt in extra.options || []" :key="opt.value" :label="opt.label || opt.value" :value="opt.value" />
  </ElSelect>
  <ElInput
    v-else-if="type === 'text'"
    v-model="innerValue"
    type="textarea"
    :rows="extra.rows || 3"
    :maxlength="extra.maxLength"
    :placeholder="extra.placeholder || '请输入'"
  />
  <ElInput
    v-else-if="type === 'string'"
    v-model="innerValue"
    :maxlength="extra.maxLength"
    :placeholder="extra.placeholder || '请输入'"
  />
  <!-- kv：键值对表格（类 query 参数，每行 key=value，值统一按字符串处理） -->
  <div v-else-if="type === 'kv'" class="kv-editor">
    <div v-for="(item, index) in kvItems" :key="index" class="kv-editor__row">
      <ElInput v-model="item.key" placeholder="key" class="kv-editor__key" />
      <span class="kv-editor__equals">=</span>
      <ElInput v-model="item.value" placeholder="value" class="kv-editor__value" />
      <ElButton :icon="Delete" text type="danger" @click="removeKv(index)" />
    </div>
    <ElButton :icon="Plus" text type="primary" @click="addKv">添加键值</ElButton>
  </div>
  <ArtCodeEditor
    v-else-if="type === 'object'"
    v-model="innerValue"
    :style="{ width: '100%', height: '180px' }"
  />
  <ElInput v-else v-model="innerValue" :placeholder="extra.placeholder || '请输入'" />
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { Delete, Plus } from '@element-plus/icons-vue'
  import { BusinessExtra } from '@/api/configure/business/type'
  import ArtCodeEditor from '@/components/core/base/art-code-editor/index.vue'

  const props = defineProps<{
    type?: string
    extra?: string
    modelValue?: any
  }>()
  const emit = defineEmits<{ (e: 'update:modelValue', value: any): void }>()

  // 解析渲染元数据（非法 JSON 回退空对象；兼容历史 "{}"）
  const extra = computed<BusinessExtra>(() => {
    if (!props.extra) return {}
    try {
      const parsed = JSON.parse(props.extra)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  })

  // 内部值：直接透传父级（控件 v-model 写回），不做类型转换（由上层按需处理）
  const innerValue = computed({
    get: () => props.modelValue,
    set: (value: any) => emit('update:modelValue', value)
  })

  // ---------- kv 键值对表格 ----------
  const kvItems = ref<{ key: string; value: string }[]>([])

  // 注意：以下函数使用 function 声明（提升），供上方 immediate watch 同步调用，避免 TDZ 未初始化错误
  // kvToRows 将 JSON 对象字符串转表格行（非法/空回退空数组）
  function kvToRows(value: any): { key: string; value: string }[] {
    try {
      const parsed = JSON.parse(value)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return []
      return Object.entries(parsed).map(([key, val]) => ({ key, value: String(val) }))
    } catch {
      return []
    }
  }

  // serializeKv 将表格行转 JSON 对象字符串（空对象输出 "{}"）
  function serializeKv(items: { key: string; value: string }[]): string {
    const map: Record<string, string> = {}
    items.forEach((item) => {
      if (item.key) map[item.key] = item.value ?? ''
    })
    return JSON.stringify(map)
  }

  // 外部值（JSON 对象字符串）→ 表格行；与当前编辑值一致时忽略（防回写循环）
  // 仅 kv 类型参与（避免对 int/string 等其它类型误触发回写）
  watch(
    () => props.modelValue,
    (value) => {
      if (props.type !== 'kv') return
      if (value === undefined || value === null) {
        if (kvItems.value.length) kvItems.value = []
        return
      }
      if (serializeKv(kvItems.value) === String(value)) return
      kvItems.value = kvToRows(value)
    },
    { immediate: true }
  )

  // 表格编辑 → 序列化回写（仅保留 key 非空的行）；仅 kv 类型参与
  watch(
    kvItems,
    () => {
      if (props.type !== 'kv') return
      emit('update:modelValue', serializeKv(kvItems.value))
    },
    { deep: true }
  )

  const addKv = () => {
    kvItems.value.push({ key: '', value: '' })
  }

  const removeKv = (index: number) => {
    kvItems.value.splice(index, 1)
  }
</script>

<style scoped lang="scss">
  .kv-editor {
    &__row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }

    &__key {
      flex: 1;
    }

    &__value {
      flex: 1;
    }

    &__equals {
      color: var(--el-text-color-secondary);
      font-family: monospace;
    }
  }
</style>