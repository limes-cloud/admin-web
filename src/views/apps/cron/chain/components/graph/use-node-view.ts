// 画布节点组件共用：从渲染上下文读取节点、校验问题与运行叠加状态

import { computed, inject } from 'vue'
import { CANVAS_CONTEXT } from './canvas-context'

/** 节点视图状态（id 为规则节点 id） */
export function useNodeView(id: () => string) {
  const ctx = inject(CANVAS_CONTEXT)
  const node = computed(() => ctx?.getNode(id()))
  const issues = computed(() => ctx?.nodeIssues(id()) || [])
  const hasError = computed(() => issues.value.some((i) => i.level === 'error'))
  const hasWarn = computed(() => issues.value.length > 0 || !!ctx?.isWarnNode(id()))
  const issueCount = computed(() => issues.value.length)
  const issueTitle = computed(() => issues.value.map((i) => i.message).join('\n'))
  const state = computed(() => ctx?.overlay(id()))
  return { ctx, node, issues, hasError, hasWarn, issueCount, issueTitle, state }
}
