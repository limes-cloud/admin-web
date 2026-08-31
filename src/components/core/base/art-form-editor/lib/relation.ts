import { FormNode, NodeRelation } from './types'

// ============================================================
// 联动求值引擎
// ============================================================

/**
 * 单条件求值
 */
export const evaluateRelation = (relation: NodeRelation, formData: Record<string, any>): boolean => {
  const val = formData[relation.field]
  switch (relation.condition) {
    case 'eq':
      return val === relation.value
    case 'neq':
      return val !== relation.value
    case 'in':
      return Array.isArray(relation.value) && relation.value.includes(val)
    case 'notIn':
      return Array.isArray(relation.value) && !relation.value.includes(val)
    case 'empty':
      return val === '' || val === null || val === undefined || (Array.isArray(val) && val.length === 0)
    case 'notEmpty':
      return val !== '' && val !== null && val !== undefined && !(Array.isArray(val) && val.length === 0)
    case 'gt':
      return Number(val) > Number(relation.value)
    case 'lt':
      return Number(val) < Number(relation.value)
    case 'gte':
      return Number(val) >= Number(relation.value)
    case 'lte':
      return Number(val) <= Number(relation.value)
    case 'contains':
      return typeof val === 'string' && val.includes(String(relation.value))
    case 'between':
      return Array.isArray(relation.value)
        && Number(val) >= Number(relation.value[0])
        && Number(val) <= Number(relation.value[1])
    case 'pattern':
      try { return new RegExp(String(relation.value)).test(String(val ?? '')) }
      catch { return false }
    default:
      return true
  }
}

/**
 * 多条件联合求值结果
 */
export interface RelationResult {
  visible: boolean
  disabled: boolean
  required: boolean
  value?: any
}

/**
 * 多条件联合求值引擎
 */
export const evaluateRelations = (
  node: FormNode,
  formData: Record<string, any>
): RelationResult => {
  const relations = node.relations || []

  if (!relations.length) {
    return {
      visible: !node.config.hidden,
      disabled: false,
      required: !!node.config.required
    }
  }

  const logic = node.relationLogic || 'and'
  const matched: Record<string, boolean> = { show: false, hide: false, disabled: false, required: false }
  let assignValue: any = undefined
  let anyMet = false

  for (const rel of relations) {
    const met = evaluateRelation(rel, formData)

    if (logic === 'and' && !met) {
      return {
        visible: !node.config.hidden,
        disabled: false,
        required: !!node.config.required
      }
    }

    if (met) {
      anyMet = true
      if (rel.effect === 'value') {
        assignValue = rel.effectValue
      } else {
        matched[rel.effect] = true
      }
    }
  }

  const triggered = logic === 'and' ? true : anyMet

  if (!triggered) {
    return { visible: !node.config.hidden, disabled: false, required: !!node.config.required }
  }

  return {
    visible: matched.hide ? false : (matched.show ? true : !node.config.hidden),
    disabled: matched.disabled,
    required: matched.required || !!node.config.required,
    value: assignValue
  }
}
