import request from '@/utils/http'

import {
  CheckDistributeAccountReply,
  CheckDistributeAccountRequest,
  CreateDistributeAccountReply,
  CreateDistributeAccountRequest,
  DeleteDistributeAccountRequest,
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
