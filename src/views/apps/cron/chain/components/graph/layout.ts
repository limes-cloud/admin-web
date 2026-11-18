// dagre 自动布局：只在首次打开缺坐标和用户点击"自动布局"时运行

import dagre from '@dagrejs/dagre'
import type { Node, Rule, UIPosition } from '../../types/dsl'
import {
  BRANCH_BOX_HEIGHT,
  BRANCH_COND_HEIGHT,
  NODE_FIELD_GAP,
  NODE_FIELD_HEIGHT,
  NODE_HEAD_HEIGHT,
  NODE_WIDTH
} from '../../utils/constants'
import { taskFields, terminalFields } from '../../utils/node-fields'

/** 节点间纵向间距（自动布局 nodesep；找空位时向下错开的间距） */
const NODE_GAP = 48

/** 层间水平间距（自动布局 ranksep；点击端口添加节点时也按此间距放在右侧） */
export const RANK_GAP = 120

/** 卡片底部留白 */
const NODE_PAD_BOTTOM = 12

/** 节点高度估算（自动布局用）：标题栏 + 字段行；分支器按每个分支的条件数累加 */
export function nodeHeight(n: Node): number {
  if (n.type === 'selector') {
    const rows = (n.branches || []).map(
      (b) => BRANCH_BOX_HEIGHT + (Math.max(b.conditions?.length || 1, 1) - 1) * BRANCH_COND_HEIGHT
    )
    rows.push(BRANCH_BOX_HEIGHT)
    return NODE_HEAD_HEIGHT + rows.reduce((sum, h) => sum + h + NODE_FIELD_GAP, 0) - NODE_FIELD_GAP + NODE_PAD_BOTTOM
  }
  const fields = n.type === 'start' || n.type === 'end' ? terminalFields(n) : taskFields(n)
  return NODE_HEAD_HEIGHT + fields.length * (NODE_FIELD_HEIGHT + NODE_FIELD_GAP) - NODE_FIELD_GAP + NODE_PAD_BOTTOM
}

/** 从左到右排布全部节点，返回每个节点左上角坐标 */
export function layoutRule(rule: Rule): Record<string, UIPosition> {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'LR', nodesep: NODE_GAP, ranksep: RANK_GAP, marginx: 20, marginy: 20 })
  g.setDefaultEdgeLabel(() => ({}))
  rule.nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: nodeHeight(n) }))
  rule.edges.forEach((e) => {
    if (g.hasNode(e.source) && g.hasNode(e.target)) g.setEdge(e.source, e.target)
  })
  dagre.layout(g)

  const out: Record<string, UIPosition> = {}
  rule.nodes.forEach((n) => {
    const p = g.node(n.id)
    // dagre 返回中心点，Vue Flow 使用左上角
    out[n.id] = { x: Math.round(p.x - NODE_WIDTH / 2), y: Math.round(p.y - nodeHeight(n) / 2) }
  })
  return out
}

/** 从 pos 开始向下找一个不与已有节点重叠的位置（新节点按普通节点高度估算） */
export function freePosition(rule: Rule, pos: UIPosition, height = NODE_HEAD_HEIGHT * 2): UIPosition {
  const boxes = rule.nodes
    .map((n) => ({ p: rule.ui?.nodes?.[n.id], h: nodeHeight(n) }))
    .filter((b): b is { p: UIPosition; h: number } => !!b.p)
  const out = { x: Math.round(pos.x), y: Math.round(pos.y) }
  for (let i = 0; i < 50; i++) {
    const hit = boxes.find(
      (b) => out.x < b.p.x + NODE_WIDTH && out.x + NODE_WIDTH > b.p.x && out.y < b.p.y + b.h && out.y + height > b.p.y
    )
    if (!hit) break
    out.y = hit.p.y + hit.h + NODE_GAP
  }
  return out
}

/** 补齐缺坐标的节点：已有坐标保持不变，缺失的取自动布局结果 */
export function fillMissingPositions(rule: Rule): boolean {
  const ui = rule.ui || (rule.ui = {})
  const pos = ui.nodes || (ui.nodes = {})
  const missing = rule.nodes.filter((n) => !pos[n.id])
  if (!missing.length) return false
  const all = layoutRule(rule)
  missing.forEach((n) => (pos[n.id] = all[n.id]))
  return true
}
