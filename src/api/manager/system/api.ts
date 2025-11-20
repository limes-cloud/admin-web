import request from '@/utils/http'
import { GetSystemSettingReply } from './type'

// ListRole 获取角色信息列表
export function GetSystemSetting() {
  return request.get<GetSystemSettingReply>({ url: '/manager/api/system/setting' })
}
