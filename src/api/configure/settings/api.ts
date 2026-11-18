import request from '@/utils/http'
import { GetSettingsReply, GetSettingsRequest, UpdateSettingsRequest } from './type'

/** 获取系统配置（当前模板引用的业务变量 + 指定环境的值） */
export function GetSettings(params: GetSettingsRequest) {
  return request.get<GetSettingsReply>({ url: '/configure/api/settings', params })
}

/** 保存系统配置（类型校验 + 落库 + 重新渲染 + 广播，保存即生效） */
export function UpdateSettings(data: UpdateSettingsRequest) {
  return request.put({ url: '/configure/api/settings', data })
}