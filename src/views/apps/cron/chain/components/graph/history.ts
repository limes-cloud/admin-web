// 撤销/重做：快照栈（JSON 字符串），上限 50 步

import type { History } from '../../types/graph'

export function createHistory(limit = 50): History {
  let past: string[] = []
  let future: string[] = []
  let present = ''

  return {
    reset(snapshot) {
      past = []
      future = []
      present = snapshot
    },
    commit(snapshot) {
      if (snapshot === present) return false
      past.push(present)
      if (past.length > limit) past.shift()
      present = snapshot
      future = []
      return true
    },
    undo() {
      const prev = past.pop()
      if (prev === undefined) return null
      future.push(present)
      present = prev
      return present
    },
    redo() {
      const next = future.pop()
      if (next === undefined) return null
      past.push(present)
      present = next
      return present
    },
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0
  }
}
