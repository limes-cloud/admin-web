import { ref, watch, nextTick, Ref } from 'vue'
import { FormNode } from './types'

export interface HistoryState {
  canUndo: Ref<boolean>
  canRedo: Ref<boolean>
  undo: () => void
  redo: () => void
  record: () => void
}

/**
 * 操作历史管理（撤销/重做）
 * @param nodes - 需要监控的节点数组 ref
 * @param maxHistory - 最大历史记录数，默认 50
 */
export function useHistory(nodes: Ref<FormNode[]>, maxHistory = 50): HistoryState {
  const undoStack: string[] = []
  const redoStack: string[] = []
  let applying = false

  const canUndo = ref(false)
  const canRedo = ref(false)
  let lastSnapshot = JSON.stringify(nodes.value)

  const updateFlags = () => {
    canUndo.value = undoStack.length > 0
    canRedo.value = redoStack.length > 0
  }

  // 手动记录当前状态
  const record = () => {
    const snapshot = JSON.stringify(nodes.value)
    if (snapshot === lastSnapshot) return
    undoStack.push(lastSnapshot)
    if (undoStack.length > maxHistory) undoStack.shift()
    redoStack.length = 0
    lastSnapshot = snapshot
    updateFlags()
  }

  // 撤销
  const undo = () => {
    if (undoStack.length === 0) return
    applying = true
    const current = JSON.stringify(nodes.value)
    redoStack.push(current)

    const prev = undoStack.pop()!
    nodes.value = JSON.parse(prev)
    lastSnapshot = prev
    updateFlags()
    nextTick(() => { applying = false })
  }

  // 重做
  const redo = () => {
    if (redoStack.length === 0) return
    applying = true
    const current = JSON.stringify(nodes.value)
    undoStack.push(current)

    const next = redoStack.pop()!
    nodes.value = JSON.parse(next)
    lastSnapshot = next
    updateFlags()
    nextTick(() => { applying = false })
  }

  // 监听节点变化自动记录（防抖 500ms）
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(
    nodes,
    () => {
      if (applying) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        if (applying) return
        const snapshot = JSON.stringify(nodes.value)
        if (snapshot === lastSnapshot) return
        undoStack.push(lastSnapshot)
        if (undoStack.length > maxHistory) undoStack.shift()
        redoStack.length = 0
        lastSnapshot = snapshot
        updateFlags()
      }, 500)
    },
    { deep: true }
  )

  return { canUndo, canRedo, undo, redo, record }
}
