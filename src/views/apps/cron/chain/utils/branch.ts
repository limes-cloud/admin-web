// 分支器的展示文本与默认值

import type { Branch } from '../types/dsl'
import { PORT_DEFAULT } from './constants'

/** 分支展示名：未命名时按序号（与后端 branchLabel 一致） */
export function branchLabel(b: Branch, index: number): string {
  if (b.name) return b.name
  return index === 0 ? '如果' : `否则如果 ${index}`
}

/** 端口展示名：分支名或"否则" */
export function portLabel(branches: Branch[] | undefined, port?: string): string {
  if (port === PORT_DEFAULT) return '否则'
  const i = (branches || []).findIndex((b) => b.id === port)
  return i < 0 ? port || '' : branchLabel(branches![i], i)
}

/** 运算符在画布上的简写符号 */
const OP_SYMBOL: Record<string, string> = {
  eq: '=',
  ne: '≠',
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
  len_gt: '长度>',
  len_gte: '长度≥',
  len_lt: '长度<',
  len_lte: '长度≤',
  contain: '包含',
  not_contain: '不包含',
  contain_key: '含键',
  not_contain_key: '不含键',
  empty: '为空',
  not_empty: '不为空',
  true: '为真',
  false: '为假'
}

/** 运算符符号；未知运算符原样返回 */
export function opSymbol(op: string): string {
  return OP_SYMBOL[op] || op
}

/** 新分支：id 在节点内唯一 */
export function newBranch(branches: Branch[]): Branch {
  const ids = new Set(branches.map((b) => b.id))
  let i = branches.length + 1
  while (ids.has(`b${i}`)) i++
  return { id: `b${i}`, logic: 'and', conditions: [{ left: '', operator: 'eq', right: '' }] }
}
