// ============================================================
// 计算属性表达式引擎
// ============================================================

/**
 * 从表达式中提取依赖字段
 */
export const extractDependencies = (expression: string): string[] => {
  const matches = expression.matchAll(/\{\{(\w+)\}\}/g)
  return [...new Set([...matches].map((m) => m[1]))]
}

/**
 * 安全执行表达式计算
 *
 * 安全策略：
 * 1. {{field}} 替换为实际值
 * 2. 白名单字符校验
 * 3. new Function 严格模式执行
 * 4. 非法表达式返回 undefined
 */
const SAFE_CHARS = /^[+\-*/%()?:.<>=!&|,\s\d.]+$/

export const evaluateExpression = (
  expression: string,
  formData: Record<string, any>
): any => {
  let expr = expression.replace(/\{\{(\w+)\}\}/g, (_, field) => {
    const val = formData[field]
    if (val === undefined || val === null || val === '') return '0'
    if (typeof val === 'string') return JSON.stringify(val)
    return String(val)
  })

  const stripped = expr.replace(/["'][^"']*["']/g, '').replace(/Math\.\w+/g, '')
  if (!SAFE_CHARS.test(stripped)) {
    console.warn('[FormEditor] unsafe expression blocked:', expression)
    return undefined
  }

  try {
    return new Function(`"use strict"; return (${expr})`)()
  } catch {
    return undefined
  }
}
