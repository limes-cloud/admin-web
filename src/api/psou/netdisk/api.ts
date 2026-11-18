import request from '@/utils/http'

import {
  CreateNetdiskReply,
  CreateNetdiskRequest,
  DeleteNetdiskRequest,
  GetNetdiskReply,
  GetNetdiskRequest,
  ListNetdiskReply,
  ListNetdiskRequest,
  UpdateNetdiskRequest,
  UpdateNetdiskStatusRequest
} from './type'

// GetNetdisk 获取网盘副本详情（包含文件树）
export function GetNetdisk(params: GetNetdiskRequest) {
  return request.get<GetNetdiskReply>({ url: '/psou/admin/netdisk', params })
}

// ListNetdisk 获取网盘副本列表
export function ListNetdisk(params: ListNetdiskRequest) {
  return request.get<ListNetdiskReply>({ url: '/psou/admin/netdisks', params })
}

// CreateNetdisk 创建网盘副本
export function CreateNetdisk(data: CreateNetdiskRequest) {
  return request.post<CreateNetdiskReply>({ url: '/psou/admin/netdisk', data })
}

// UpdateNetdisk 更新网盘副本
export function UpdateNetdisk(data: UpdateNetdiskRequest) {
  return request.put({ url: '/psou/admin/netdisk', data })
}

// DeleteNetdisk 删除网盘副本
export function DeleteNetdisk(params: DeleteNetdiskRequest) {
  return request.del({ url: '/psou/admin/netdisk', params })
}

// UpdateNetdiskStatus 更新网盘副本状态
export function UpdateNetdiskStatus(data: UpdateNetdiskStatusRequest) {
  return request.put({ url: '/psou/admin/netdisk/status', data })
}
