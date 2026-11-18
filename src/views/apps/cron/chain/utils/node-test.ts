// 单节点测试：找出节点引用的流程变量，并把填写的值组装成变量池

import type { Node } from '../types/dsl'

const PLACEHOLDER = /\$\{([a-zA-Z_][a-zA-Z0-9_-]*(?:\.[a-zA-Z0-9_-]+)*)\}/g
const DATA_LOAD = /ctx\.data\.load\(\s*['"`]([a-zA-Z_][a-zA-Z0-9_-]*(?:\.[a-zA-Z0-9_-]+)*)['"`]\s*\)/g

/** 引擎自动提供的变量根（测试时不用填写） */
const BUILTIN_ROOTS = new Set(['run'])

function collect(v: unknown, out: Set<string>) {
  if (typeof v === 'string') {
    for (const m of v.matchAll(PLACEHOLDER)) out.add(m[1])
  } else if (Array.isArray(v)) {
    v.forEach((x) => collect(x, out))
  } else if (v && typeof v === 'object') {
    Object.values(v).forEach((x) => collect(x, out))
  }
}

/**
 * 节点执行前要用到的流程变量路径：url / header / input 中的 ${...}，以及脚本里 ctx.data.load('...')；
 * 输出映射、成功判定、失败信息以执行结果为根，不算在内。去掉被更短路径覆盖的子路径（填了 order 就不用再填 order.no）
 */
export function testVarPaths(node: Node): string[] {
  const refs = new Set<string>()
  collect([node.url, node.header, node.input], refs)
  if (node.code) for (const m of node.code.matchAll(DATA_LOAD)) refs.add(m[1])
  const paths = [...refs].filter((p) => {
    const root = p.split('.')[0]
    if (BUILTIN_ROOTS.has(root)) return false
    return root !== 'trigger' || node.mode === 'trigger'
  })
  return paths.filter((p) => !paths.some((q) => q !== p && p.startsWith(`${q}.`))).sort()
}

/** 输入值：合法 JSON（数字、布尔、对象、数组、带引号字符串）按 JSON 解析，否则按字符串 */
export function parseTestValue(raw: string): unknown {
  const s = raw.trim()
  if (s === '') return ''
  try {
    return JSON.parse(s)
  } catch {
    return raw
  }
}

/** 按路径写入嵌套对象，组装变量池 */
export function buildTestVars(values: Record<string, string>): Record<string, any> {
  const vars: Record<string, any> = {}
  for (const [path, raw] of Object.entries(values)) {
    const keys = path.split('.')
    let cur = vars
    keys.slice(0, -1).forEach((k) => {
      if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {}
      cur = cur[k]
    })
    cur[keys[keys.length - 1]] = parseTestValue(raw)
  }
  return vars
}
