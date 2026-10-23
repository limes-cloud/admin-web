import request from '@/utils/http'

import {
  CreateNetdiskReply,
  CreateNetdiskRequest,
  DeleteNetdiskRequest,
  ListNetdiskReply,
  ListNetdiskRequest,
  UpdateNetdiskRequest,
  UpdateNetdiskStatusRequest
} from './type'

// ListNetdisks 获取网盘副本列表
export function ListNetdisks(params: ListNetdiskRequest) {
  return request.get<ListNetdiskReply>({ url: '/psou/api/netdisks', params })
}

// CreateNetdisk 创建网盘副本（后端初始状态固定为失效）
export function CreateNetdisk(data: CreateNetdiskRequest) {
  return request.post<CreateNetdiskReply>({ url: '/psou/api/netdisks', data })
}

// UpdateNetdisk 更新网盘副本
export function UpdateNetdisk(data: UpdateNetdiskRequest) {
  return request.put({ url: '/psou/api/netdisks', data })
}

// DeleteNetdisk 删除网盘副本
export function DeleteNetdisk(params: DeleteNetdiskRequest) {
  return request.del({ url: '/psou/api/netdisks', params })
}

// UpdateNetdiskStatus 更新网盘副本状态
export function UpdateNetdiskStatus(data: UpdateNetdiskStatusRequest) {
  return request.put({ url: '/psou/api/netdisks/status', data })
}
