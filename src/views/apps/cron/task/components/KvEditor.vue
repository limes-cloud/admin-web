<template>
  <div class="kv-editor">
    <div v-for="(row, index) in rows" :key="index" class="kv-editor__row">
      <ElInput v-model="row.key" placeholder="Key" class="kv-editor__key" />
      <ElInput v-model="row.value" :placeholder="valuePlaceholder" class="kv-editor__value" />
      <ElButton :icon="Delete" text @click="removeRow(index)" />
    </div>
    <ElButton :icon="Plus" text type="primary" @click="addRow">添加参数</ElButton>
  </div>
</template>

<script setup lang="ts">
  import { Delete, Plus } from '@element-plus/icons-vue'

  interface KvRow {
    key: string
    value: string
  }

  const props = withDefaults(
    defineProps<{
      modelValue?: Record<string, any>
      valuePlaceholder?: string
    }>(),
    { modelValue: () => ({}), valuePlaceholder: 'Value' }
  )

  const emit = defineEmits<{ 'update:modelValue': [Record<string, any>] }>()

  // 以传入对象初始化编辑行，Key 需唯一（对象键本身唯一）
  const rows = ref<KvRow[]>(
    Object.entries(props.modelValue || {}).map(([key, value]) => ({ key, value: String(value) }))
  )

  // 编辑行同步为对象，空 Key 行忽略
  const sync = () => {
    const obj: Record<string, any> = {}
    rows.value.forEach((r) => {
      if (r.key.trim()) {
        obj[r.key.trim()] = r.value
      }
    })
    emit('update:modelValue', obj)
  }

  const addRow = () => {
    rows.value.push({ key: '', value: '' })
  }

  const removeRow = (index: number) => {
    rows.value.splice(index, 1)
    sync()
  }

  watch(rows, sync, { deep: true })
</script>

<style scoped>
  .kv-editor__row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .kv-editor__key {
    width: 40%;
    flex-shrink: 0;
  }

  .kv-editor__value {
    flex: 1;
  }
</style>
