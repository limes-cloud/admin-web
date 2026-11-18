<template>
  <NodeCard
    :title="node?.name || CONTROL_LABEL.selector"
    :color="NODE_COLOR.selector"
    :selected="selected"
    :has-error="hasError"
    :has-warn="hasWarn"
    :issue-count="issueCount"
    :issue-title="issueTitle"
    :state-class="state ? `st-${state.status}` : ''"
    @status-click="ctx?.openStatus(id)"
  >
    <template #icon>
      <ElIcon><Share /></ElIcon>
    </template>
    <template v-for="row in rows" :key="row.port">
      <span class="nc-label">{{ row.label }}</span>
      <div class="sn-box">
        <template v-for="(c, j) in row.conditions" :key="j">
          <div v-if="j > 0" class="sn-logic">{{ row.logic === 'or' ? '或' : '且' }}</div>
          <div class="sn-cond">
            <span class="nc-tag sn-cond__left" :title="c.left"
              ><span>{{ c.left || '未选择变量' }}</span></span
            >
            <span class="sn-cond__op">{{ opSymbol(c.operator) }}</span>
            <span v-if="hasRight(c.operator)" class="sn-cond__right" :title="rightText(c.right)">{{
              rightText(c.right) || '-'
            }}</span>
          </div>
        </template>
        <Handle :id="row.port" type="source" :position="Position.Right" class="sn-port" />
      </div>
    </template>
    <template v-if="state" #status>
      <span :class="`cn-state is-${state.status}`">{{ NODE_STATUS[state.status]?.label || state.status }}</span>
    </template>
    <template #ports>
      <Handle type="target" :position="Position.Left" :style="{ top: `${NODE_HEAD_HEIGHT / 2}px` }" />
    </template>
  </NodeCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Handle, Position } from '@vue-flow/core'
  import { Share } from '@element-plus/icons-vue'
  import NodeCard from './NodeCard.vue'
  import { useNodeView } from './use-node-view'
  import type { Condition, Operator } from '../../types/dsl'
  import { branchLabel, opSymbol } from '../../utils/branch'
  import {
    CONTROL_LABEL,
    NODE_COLOR,
    NODE_HEAD_HEIGHT,
    NODE_STATUS,
    OPERATORS,
    PORT_DEFAULT
  } from '../../utils/constants'

  // 分支器节点（参考 Coze 选择器）：每个分支一行条件框，框右侧是该分支的出端口，最后一行是"否则"
  defineOptions({ name: 'SelectorNode', inheritAttrs: false })

  const props = defineProps<{ id: string; selected?: boolean }>()

  const { ctx, node, hasError, hasWarn, issueCount, issueTitle, state } = useNodeView(() => props.id)

  const rows = computed(() => {
    const list: { port: string; label: string; logic?: string; conditions: Condition[] }[] = (
      node.value?.branches || []
    ).map((b, i) => ({ port: b.id, label: branchLabel(b, i), logic: b.logic, conditions: b.conditions || [] }))
    list.push({ port: PORT_DEFAULT, label: '否则', conditions: [] })
    return list
  })

  function hasRight(op: Operator): boolean {
    return OPERATORS.find((o) => o.value === op)?.right !== false
  }

  function rightText(v: unknown): string {
    if (v === undefined || v === null) return ''
    return typeof v === 'string' ? v : JSON.stringify(v)
  }
</script>

<style scoped lang="scss">
  .sn-box {
    position: relative;
    box-sizing: border-box;
    min-width: 0;
    min-height: 32px;
    padding: 4px;
    background: var(--el-bg-color);
    border: 1px solid rgb(6 7 9 / 12%);
    border-radius: 6px;
  }

  .sn-cond {
    display: flex;
    gap: 4px;
    align-items: center;
    min-width: 0;
  }

  .sn-cond__left {
    flex: 1;
  }

  .sn-cond__op {
    flex-shrink: 0;
    min-width: 16px;
    font-weight: 600;
    color: var(--el-text-color-regular);
    text-align: center;
  }

  .sn-cond__right {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sn-logic {
    padding: 0 4px;
    font-size: 11px;
    line-height: 18px;
    color: var(--el-color-primary);
  }

  // 端口贴卡片右边缘：字段区右内边距 12px + 卡片边框 1px
  .sn-port {
    right: -13px;
  }
</style>
