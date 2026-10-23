export interface Setting {
  id: number
  keyword: string
  name: string
  type: string
  value: string
  extra: string
  description: string
  sort: number
  createdAt: number
  updatedAt: number
}

export interface ListSettingRequest {
  keyword?: string
  name?: string
  type?: string
}

export interface ListSettingReply {
  list: Setting[]
  total: number
}

export interface CreateSettingRequest {
  keyword: string
  name: string
  type: string
  value?: string
  extra?: string
  description?: string
  sort?: number
}

export interface CreateSettingReply {
  id: number
}

export interface UpdateSettingRequest {
  id: number
  name: string
  type: string
  value?: string
  extra?: string
  description?: string
  sort?: number
}

export interface DeleteSettingRequest {
  id: number
}

export interface BatchUpdateSettingItem {
  id: number
  value: string
}

export interface BatchUpdateSettingsRequest {
  items: BatchUpdateSettingItem[]
}
