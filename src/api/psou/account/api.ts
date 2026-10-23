import request from '@/utils/http'

import {
  CheckAccountRequest,
  CreateAccountReply,
  CreateAccountRequest,
  DeleteAccountRequest,
  ListAccountReply,
  ListAccountRequest,
  RecoverAccountRequest,
  UpdateAccountRequest
} from './type'

// ListAccounts 获取网盘账号列表
export function ListAccounts(params: ListAccountRequest) {
  return request.get<ListAccountReply>({ url: '/psou/api/accounts', params })
}

// CreateAccount 创建网盘账号
export function CreateAccount(data: CreateAccountRequest) {
  return request.post<CreateAccountReply>({ url: '/psou/api/accounts', data })
}

// UpdateAccount 更新网盘账号
export function UpdateAccount(data: UpdateAccountRequest) {
  return request.put({ url: '/psou/api/accounts', data })
}

// DeleteAccount 删除网盘账号
export function DeleteAccount(params: DeleteAccountRequest) {
  return request.del({ url: '/psou/api/accounts', params })
}

// CheckAccount 检测网盘账号登录态
export function CheckAccount(data: CheckAccountRequest) {
  return request.post({ url: '/psou/api/accounts/check', data })
}

// RecoverAccount 手工触发限流账号恢复检测
export function RecoverAccount(data: RecoverAccountRequest) {
  return request.post({ url: '/psou/api/accounts/recover', data })
}
