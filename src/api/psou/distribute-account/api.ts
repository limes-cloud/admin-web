import request from '@/utils/http'

import {
  CheckDistributeAccountReply,
  CheckDistributeAccountRequest,
  CreateDistributeAccountQRSessionReply,
  CreateDistributeAccountQRSessionRequest,
  CreateDistributeAccountReply,
  CreateDistributeAccountRequest,
  DeleteDistributeAccountRequest,
  GetDistributeAccountQRSessionReply,
  GetDistributeAccountQRSessionRequest,
  ListDistributeAccountReply,
  ListDistributeAccountRequest,
  ListDistributeChannelsReply,
  ListDistributeChannelsRequest,
  UpdateDistributeAccountRequest
} from './type'

// ListDistributeChannels 获取分发渠道字典
export function ListDistributeChannels(params?: ListDistributeChannelsRequest) {
  return request.get<ListDistributeChannelsReply>({ url: '/psou/api/distribute/channels', params })
}

// ListDistributeAccounts 获取分发账号列表
export function ListDistributeAccounts(params: ListDistributeAccountRequest) {
  return request.get<ListDistributeAccountReply>({ url: '/psou/api/distribute/accounts', params })
}

// CreateDistributeAccountQRSession 创建分发账号扫码登录会话
export function CreateDistributeAccountQRSession(data: CreateDistributeAccountQRSessionRequest) {
  return request.post<CreateDistributeAccountQRSessionReply>({
    url: '/psou/api/distribute/accounts/qr/session',
    data
  })
}

// GetDistributeAccountQRSession 查询分发账号扫码登录状态
export function GetDistributeAccountQRSession(params: GetDistributeAccountQRSessionRequest) {
  return request.get<GetDistributeAccountQRSessionReply>({
    url: '/psou/api/distribute/accounts/qr/session',
    params
  })
}

// CreateDistributeAccount 创建分发账号
export function CreateDistributeAccount(data: CreateDistributeAccountRequest) {
  return request.post<CreateDistributeAccountReply>({ url: '/psou/api/distribute/accounts', data })
}

// UpdateDistributeAccount 更新分发账号
export function UpdateDistributeAccount(data: UpdateDistributeAccountRequest) {
  return request.put({ url: '/psou/api/distribute/accounts', data })
}

// DeleteDistributeAccount 删除分发账号
export function DeleteDistributeAccount(params: DeleteDistributeAccountRequest) {
  return request.del({ url: '/psou/api/distribute/accounts', params })
}

// CheckDistributeAccount 检测分发账号
export function CheckDistributeAccount(data: CheckDistributeAccountRequest) {
  return request.post<CheckDistributeAccountReply>({ url: '/psou/api/distribute/accounts/check', data })
}
