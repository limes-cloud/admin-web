// 校验问题类型，对齐后端静态校验返回格式（13-静态校验）

export type IssueLevel = 'error' | 'warning'

export type IssueTarget = 'rule' | 'node' | 'edge'

/** 校验问题 */
export interface Issue {
  level: IssueLevel
  target: IssueTarget
  /** 节点或边 id；target=rule 时为空 */
  id: string
  /** 字段路径，如 retry.0.maxAttempts */
  field: string
  /** 稳定的机器可读码 */
  code: string
  message: string
}

/** 连线本地预检结果 */
export interface ConnectCheck {
  ok: boolean
  reason?: string
}
