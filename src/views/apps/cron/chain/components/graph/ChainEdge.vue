<template>
  <BaseEdge :id="id" :path="path[0]" :marker-end="markerEnd" :style="edgeStyle" :interaction-width="16" />
  <EdgeLabelRenderer>
    <div
      v-if="label || issues.length"
      class="chain-edge__label nodrag nopan"
      :class="{ 'is-error': hasError, 'is-selected': selected, 'is-pruned': pruned }"
      :style="{ transform: `translate(-50%, -50%) translate(${path[1]}px, ${path[2]}px)` }"
      :title="issueTitle || label"
    >
      <span>{{ label || '!' }}</span>
    </div>
  </EdgeLabelRenderer>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue'
  import type { CSSProperties } from 'vue'
  import { BaseEdge, EdgeLabelRenderer, getBezierPath, Position } from '@vue-flow/core'
  import { CANVAS_CONTEXT } from './canvas-context'
  import { EDGE_COLOR } from './flow-convert'
  import { portLabel } from '../../utils/branch'

  defineOptions({ name: 'ChainEdge', inheritAttrs: false })

  const props = defineProps<{
    id: string
    source: string
    target: string
    sourceX: number
    sourceY: number
    targetX: number
    targetY: number
    sourcePosition: Position
    targetPosition: Position
    markerEnd?: string
    selected?: boolean
  }>()

  const ctx = inject(CANVAS_CONTEXT)

  const path = computed(() =>
    getBezierPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      sourcePosition: props.sourcePosition,
      targetX: props.targetX,
      targetY: props.targetY,
      targetPosition: props.targetPosition
    })
  )

  const edge = computed(() => ctx?.getEdge(props.id))
  /** 分支器出边显示分支名 */
  const label = computed(() => {
    const e = edge.value
    if (!e?.sourcePort) return ''
    return portLabel(ctx?.getNode(e.source)?.branches, e.sourcePort)
  })
  const issues = computed(() => ctx?.edgeIssues(props.id) || [])
  const hasError = computed(() => issues.value.some((i) => i.level === 'error'))
  const issueTitle = computed(() => issues.value.map((i) => i.message).join('\n'))

  /** 剪枝路径：target 已跳过，且 source 已终态 */
  const pruned = computed(() => {
    const t = ctx?.overlay(props.target)
    const s = ctx?.overlay(props.source)
    if (t?.status !== 'skipped' || !s) return false
    return s.status !== 'running' && s.status !== 'ready' && s.status !== 'pending'
  })

  const edgeStyle = computed<CSSProperties>(() => {
    if (hasError.value) return { stroke: 'var(--el-color-danger)', strokeWidth: 2 }
    if (props.selected) return { stroke: 'var(--el-color-primary)', strokeWidth: 2 }
    if (pruned.value) return { stroke: 'var(--el-text-color-placeholder)', strokeDasharray: '5 4' }
    return { stroke: EDGE_COLOR, strokeWidth: 1.5 }
  })
</script>

<style scoped lang="scss">
  .chain-edge__label {
    position: absolute;
    z-index: 1;
    max-width: 180px;
    padding: 1px 6px;
    overflow: hidden;
    font-size: 11px;
    color: var(--el-text-color-regular);
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: all;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 4px;

    &.is-selected {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }

    &.is-error {
      color: var(--el-color-danger);
      border-color: var(--el-color-danger);
    }

    &.is-pruned {
      color: var(--el-text-color-placeholder);
      border-style: dashed;
    }
  }
</style>
