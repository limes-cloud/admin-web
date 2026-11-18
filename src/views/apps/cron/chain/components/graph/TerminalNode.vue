<template>
  <NodeCard
    :title="node?.name || CONTROL_LABEL[kind]"
    :color="NODE_COLOR[kind]"
    :selected="selected"
    :has-error="hasError"
    :has-warn="hasWarn"
    :issue-count="issueCount"
    :issue-title="issueTitle"
    :state-class="state ? `st-${state.status}` : ''"
    @status-click="ctx?.openStatus(id)"
  >
    <template #icon>
      <ElIcon><VideoPlay v-if="kind === 'start'" /><CircleCheck v-else /></ElIcon>
    </template>
    <NodeFields :fields="fields" />
    <template v-if="state" #status>
      <span :class="`cn-state is-${state.status}`">{{ NODE_STATUS[state.status]?.label || state.status }}</span>
    </template>
    <template #ports>
      <Handle v-if="kind === 'end'" type="target" :position="Position.Left" :style="headPort" />
      <Handle v-else type="source" :position="Position.Right" :style="headPort" />
    </template>
  </NodeCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Handle, Position } from '@vue-flow/core'
  import { CircleCheck, VideoPlay } from '@element-plus/icons-vue'
  import NodeCard from './NodeCard.vue'
  import NodeFields from './NodeFields.vue'
  import { useNodeView } from './use-node-view'
  import { CONTROL_LABEL, NODE_COLOR, NODE_HEAD_HEIGHT, NODE_STATUS } from '../../utils/constants'
  import { terminalFields } from '../../utils/node-fields'

  // 开始 / 结束节点：开始列出入参字段，结束列出返回字段
  defineOptions({ name: 'TerminalNode', inheritAttrs: false })

  const props = defineProps<{ id: string; selected?: boolean }>()

  const { ctx, node, hasError, hasWarn, issueCount, issueTitle, state } = useNodeView(() => props.id)

  const kind = computed(() => (node.value?.type === 'end' ? 'end' : 'start'))

  const fields = computed(() => (node.value ? terminalFields(node.value) : []))

  /** 端口对齐标题栏中线 */
  const headPort = { top: `${NODE_HEAD_HEIGHT / 2}px` }
</script>
