<template>
  <template v-for="node in visibleNodes" :key="node.id">
    <!-- 子表单节点 -->
    <GroupRenderer
      v-if="node.type === 'group'"
      :node="node"
      :form-data="formData"
      :readonly="readonly"
      :schema="schema"
    />

    <!-- 字段节点 -->
    <FieldRenderer
      v-else-if="isField(node)"
      :node="node"
      :form-data="formData"
      :readonly="readonly"
      :schema="schema"
    />

    <!-- 容器节点 -->
    <ContainerRenderer
      v-else-if="isContainer(node)"
      :node="node"
      :form-data="formData"
      :readonly="readonly"
      :schema="schema"
    />

    <!-- 辅助节点 -->
    <AideRenderer v-else :node="node" />
  </template>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { FormNode, FormSchema, isFieldNode, isContainerNode } from '../../lib/types'
  import { evaluateRelations } from '../../lib/relation'
  import FieldRenderer from './FieldRenderer.vue'
  import ContainerRenderer from './ContainerRenderer.vue'
  import AideRenderer from './AideRenderer.vue'
  import GroupRenderer from './GroupRenderer.vue'

  const props = defineProps<{
    nodes: FormNode[]
    formData: Record<string, any>
    readonly: boolean
    schema: FormSchema
  }>()

  const isField = (node: FormNode) => isFieldNode(node)
  const isContainer = (node: FormNode) => isContainerNode(node)

  // 所有节点（含容器）统一走联动判断
  const visibleNodes = computed(() => {
    return props.nodes.filter((node) => {
      return evaluateRelations(node, props.formData).visible
    })
  })
</script>
