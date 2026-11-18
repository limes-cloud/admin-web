import request from '@/utils/http'

import { BatchUpdateSettingsRequest, ListSettingReply } from './type'

// ListSetting 获取后端下发的站点配置项定义与当前值
export function ListSetting() {
  return request.get<ListSettingReply>({ url: '/psou/admin/settings' })
}

// BatchUpdateSettings 批量保存站点配置
export function BatchUpdateSettings(data: BatchUpdateSettingsRequest) {
  return request.put({ url: '/psou/admin/settings', data })
}
