export interface GetSettingsRequest {
  app?: string
  envId: number
}

export interface SettingsItem {
  keyword: string
  type: string
  description: string
  extra: string
  value: string
}

export interface GetSettingsReply {
  app: string
  envId: number
  format: string
  items: SettingsItem[]
}

export interface UpdateSettingsItem {
  keyword: string
  value: string
}

export interface UpdateSettingsRequest {
  app?: string
  envId: number
  items: UpdateSettingsItem[]
}

export type { BusinessExtra } from '../business/type'