<template>
  <NodeCard
    :title="node?.name || id"
    :color="color"
    @dblclick="enterLoop()"
    :selected="selected"
    :has-error="hasError"
    :has-warn="hasWarn"
    :issue-count="issueCount"
    :issue-title="issueTitle"
    :state-class="stateClass"
    @status-click="ctx?.openStatus(id)"
  >
    <template #icon>
      <ArtIcon v-if="tpl?.icon" :value="tpl.icon" :size="20" />
      <ElIcon v-else-if="node?.plugin"><Box /></ElIcon>
      <ElIcon v-else-if="node?.type === 'script'"><Document /></ElIcon>
      <ElIcon v-else><Connection /></ElIcon>
    </template>
    <template #extra>
      <ElIcon
        v-if="node?.type === 'loop'"
        class="nc-loop-icon"
        :size="14"
        title="进入循环体编辑"
        @click.stop="enterLoop()"
      >
        <ArrowRight />
      </ElIcon>
      <span v-if="node?.mode === 'trigger'" class="nc-chip">被动触发</span>
      <span v-if="node?.suspend" class="nc-chip">延迟重跑</span>
      <span v-if="state?.status === 'ignored'" class="nc-chip">已忽略</span>
      <span v-if="state?.status === 'bypassed'" class="nc-chip">条件跳过</span>
    </template>
    <NodeFields :fields="fields" />
    <template v-if="state" #status>
      <ElIcon v-if="spinning" class="is-loading"><Loading /></ElIcon>
      <span :class="`cn-state is-${state.status}`">{{ stateText }}</span>
      <span v-if="costText" class="cn-cost" title="执行耗时（含重试）">{{ costText }}</span>
    </template>
    <template #ports>
      <Handle type="target" :position="Position.Left" :style="headPort" />
      <Handle type="source" :position="Position.Right" :style="headPort" />
    </template>
  </NodeCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Handle, Position } from '@vue-flow/core'
  import { ArrowRight, Box, Connection, Document, Loading } from '@element-plus/icons-vue'
  import NodeCard from './NodeCard.vue'
  import NodeFields from './NodeFields.vue'
  import { useNodeView } from './use-node-view'
  import { useChainEditorStore } from '@/store/modules/chain-editor'
  import { NODE_COLOR, NODE_HEAD_HEIGHT, NODE_STATUS } from '../../utils/constants'
  import { formatCost, formatDuration } from '../../utils/format'
  import { taskFields } from '../../utils/node-fields'

  // 任务节点（api / script / 模板）：标题栏 + 请求 / 触发 / 输出字段，运行态显示在底部状态条
  defineOptions({ name: 'ChainNode', inheritAttrs: false })

  const props = defineProps<{ id: string; selected?: boolean }>()

  const { ctx, node, hasError, hasWarn, issueCount, issueTitle, state } = useNodeView(() => props.id)
  const tpl = computed(() => (node.value?.plugin ? ctx?.getPlugin(node.value.plugin) : undefined))

  /** 端口对齐标题栏中线 */
  const headPort = { top: `${NODE_HEAD_HEIGHT / 2}px` }

  const color = computed(() => {
    const n = node.value
    if (n?.mode === 'trigger') return NODE_COLOR.trigger
    if (n?.type === 'loop') return NODE_COLOR.selector
    // 插件节点：优先用插件自己的图标背景色（icon_bg），未设置回退类型色
    if (n?.plugin) return tpl.value?.iconBg || NODE_COLOR.plugin
    return n?.type === 'script' ? NODE_COLOR.script : NODE_COLOR.api
  })

  const fields = computed(() => (node.value ? taskFields(node.value, tpl.value?.name) : []))

  /** 被动节点运行中且未触发 = 待触发 */
  const waiting = computed(() => state.value?.status === 'running' && state.value.trigger?.status === 'waiting')

  const spinning = computed(() => state.value?.status === 'running' && !waiting.value)

  const stateClass = computed(() => {
    const s = state.value
    if (!s) return ''
    if (waiting.value) return 'st-waiting'
    return `st-${s.status}`
  })

  /** 执行结束后显示耗时（执行中、待触发、未开始不显示） */
  const costText = computed(() => {
    const s = state.value
    if (!s || !['success', 'fail', 'ignored'].includes(s.status) || s.costMs === undefined) return ''
    return formatCost(s.costMs)
  })

  /** 进入循环体子图编辑（点击右侧箭头或双击） */
  function enterLoop(): void {
    const n = node.value
    if (n?.type === 'loop') useChainEditorStore().enterLoop(n.id)
  }

  const stateText = computed(() => {
    const s = state.value
    if (!s) return ''
    if (waiting.value) {
      const now = ctx?.now.value || 0
      const waited = s.trigger?.startedAt ? formatDuration(now - s.trigger.startedAt) : '-'
      const left = s.trigger?.deadlineAt ? formatDuration(s.trigger.deadlineAt - now) : '-'
      return `待触发 已等 ${waited} / 剩 ${left}`
    }
    if (s.status === 'fail') return `失败${s.error ? '：' + s.error : ''}`
    return NODE_STATUS[s.status]?.label || s.status
  })
</script>

<style scoped>
  .nc-loop-icon {
    color: var(--el-color-primary);
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
      transform: translateX(2px);
    }
  }
</style>
