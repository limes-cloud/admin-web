<template>
  <div class="group-renderer">
    <div v-if="node.label" class="group-renderer__title">{{ node.label }}</div>
    <div
      v-for="(item, index) in items"
      :key="index"
      class="group-renderer__item"
      :class="{ 'group-renderer__item--card': node.config.groupLayout === 'card' }"
    >
      <div class="group-renderer__item-header">
        <span class="group-renderer__item-index">{{ index + 1 }}</span>
        <span v-if="node.config.groupItemTitle" class="group-renderer__item-title">
          {{ node.config.groupItemTitle }} {{ index + 1 }}
        </span>
        <el-button
          v-if="!readonly && canRemove"
          :icon="Delete"
          type="danger"
          text
          size="small"
          @click="removeItem(index)"
        />
      </div>
      <div class="group-renderer__item-body">
        <el-form
          :model="item"
          :label-position="schema.config.labelPosition"
          :label-width="schema.config.labelWidth"
          :size="schema.config.size"
        >
          <RenderNodes
            :nodes="node.children || []"
            :form-data="item"
            :readonly="readonly"
            :schema="schema"
          />
        </el-form>
      </div>
    </div>
    <el-button
      v-if="!readonly && canAdd"
      type="primary"
      text
      :icon="Plus"
      @click="addItem"
    >
      添加{{ node.label || '条目' }}
    </el-button>
  </div>
</template>

<script lang="ts" setup>
  import { computed, reactive } from 'vue'
  import { FormNode, FormSchema } from '../../lib/types'
  import { Delete, Plus } from '@element-plus/icons-vue'
  import RenderNodes from './RenderNodes.vue'

  const props = defineProps<{
    node: FormNode
    formData: Record<string, any>
    readonly: boolean
    schema: FormSchema
  }>()

  // 确保 formData 中该字段为数组
  if (!Array.isArray(props.formData[props.node.field!])) {
    props.formData[props.node.field!] = []
  }

  const items = computed(() => props.formData[props.node.field!] as Record<string, any>[])

  const canAdd = computed(() => {
    const max = props.node.config.groupMax ?? 10
    return items.value.length < max
  })

  const canRemove = computed(() => {
    const min = props.node.config.groupMin ?? 0
    return items.value.length > min
  })

  // 根据组件类型获取合适的默认值
  const getFieldDefault = (child: FormNode): any => {
    if (child.config.value !== undefined) return child.config.value
    switch (child.type) {
      case 'checkbox':
      case 'cascader':
        return []
      case 'number':
      case 'slider':
      case 'rate':
        return 0
      case 'switch':
        return false
      default:
        return ''
    }
  }

  // 根据 children 模板生成一行的默认值
  const createDefaultRow = (): Record<string, any> => {
    const row: Record<string, any> = {}
    const children = props.node.children || []
    for (const child of children) {
      if (child.field) {
        row[child.field] = getFieldDefault(child)
      }
    }
    return reactive(row)
  }

  // 初始化时填充到最少条目数
  const minCount = props.node.config.groupMin ?? 0
  if (items.value.length < minCount) {
    for (let i = items.value.length; i < minCount; i++) {
      items.value.push(createDefaultRow())
    }
  }

  const addItem = () => {
    items.value.push(createDefaultRow())
  }

  const removeItem = (index: number) => {
    items.value.splice(index, 1)
  }
</script>

<style lang="scss" scoped>
  .group-renderer {
    margin-bottom: 16px;

    &__title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 12px;
    }

    &__item {
      position: relative;
      margin-bottom: 12px;
      padding: 12px;
      border-radius: 4px;

      &--card {
        border: 1px solid #e4e7ed;
        background: #fafafa;
      }
    }

    &__item-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .el-button {
        margin-left: auto;
      }
    }

    &__item-index {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      background: var(--el-color-primary);
      border-radius: 50%;
    }

    &__item-title {
      font-size: 13px;
      font-weight: 500;
      color: #606266;
    }

    &__item-body {
      padding-left: 4px;
    }
  }
</style>
