import request from '@/utils/http'

import {
  BatchUpdateSettingsRequest,
  CreateSettingReply,
  CreateSettingRequest,
  DeleteSettingRequest,
  ListSettingReply,
  ListSettingRequest,
  UpdateSettingRequest
} from './type'

// ListSettings 获取站点配置列表（不分页）
export function ListSettings(params: ListSettingRequest = {}) {
  return request.get<ListSettingReply>({ url: '/psou/api/settings', params })
}

// CreateSetting 创建配置项
export function CreateSetting(data: CreateSettingRequest) {
  return request.post<CreateSettingReply>({ url: '/psou/api/settings', data })
}

// UpdateSetting 更新配置项（keyword 不可改）
export function UpdateSetting(data: UpdateSettingRequest) {
  return request.put({ url: '/psou/api/settings', data })
}

// DeleteSetting 删除配置项
export function DeleteSetting(params: DeleteSettingRequest) {
  return request.del({ url: '/psou/api/settings', params })
}

// BatchUpdateSettings 批量保存配置值（全部成功或全部失败）
export function BatchUpdateSettings(data: BatchUpdateSettingsRequest) {
  return request.put({ url: '/psou/api/settings/batch', data })
}
