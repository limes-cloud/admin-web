export interface SettingItem {
  key: string
  name: string
  widget: string
  description: string
  placeholder: string
  rows: number
  sort: number
  enabled: boolean
  value: string
  required: boolean
  maxLen: number
  fileName: string
  fileNameLabel: string
  fileNamePlaceholder: string
}

export interface ListSettingReply {
  list: SettingItem[]
}

export interface BatchUpdateSettingItem {
  key: string
  enabled: boolean
  value: string
  fileName: string
}

export interface BatchUpdateSettingsRequest {
  items: BatchUpdateSettingItem[]
}
