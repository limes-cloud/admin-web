export interface SyncConfigureRequest {
  app: string
  envId: number
  description: string
}

export interface CompareConfigureRequest {
  app: string
  envId: number
}

export interface CompareConfigureInfo {
  type: string
  key: string
  old: string
  cur: string
}

export interface CompareConfigureReply {
  list: CompareConfigureInfo[]
}
