import request from '@/utils/http'

import {
  ListUserReply,
  ListUserRequest,
  CreateUserReply,
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  User,
  GetUserRequest,
  ResetPasswordRequest,
  OfflineUserRequest,
  UpdateCurrentUserRequest,
  UpdateCurrentUserPasswordRequest,
  GetUserAppsRequest,
  GetUserAppsReply,
  UpdateUserAppsRequest
} from './type'

// GetCurrentUser 获取当前用户信息
export function GetCurrentUser() {
  return request.get<User>({ url: '/manager/api/current/user' })
}

// GetUser 获取用户信息
export function GetUser(params: GetUserRequest) {
  return request.get<User>({ url: '/manager/api/user', params })
}

// ListUser 获取用户信息列表
export function ListUser(params: ListUserRequest) {
  return request.get<ListUserReply>({ url: '/manager/api/users', params })
}

// CreateUser 创建用户信息
export function CreateUser(data: CreateUserRequest) {
  return request.post<CreateUserReply>({ url: '/manager/api/user', data })
}

// GetUserApps 获取用户的应用授权列表
export function GetUserApps(params: GetUserAppsRequest) {
  return request.get<GetUserAppsReply>({ url: '/manager/api/user/apps', params })
}

// UpdateUserApps 更新用户的应用授权列表
export function UpdateUserApps(data: UpdateUserAppsRequest) {
  return request.put({ url: '/manager/api/user/apps', data })
}

// UpdateUser 更新用户信息
export function UpdateUser(data: UpdateUserRequest) {
  return request.put({ url: '/manager/api/user', data })
}

// DeleteUser 删除用户信息
export function DeleteUser(params: DeleteUserRequest) {
  return request.del({ url: '/manager/api/user', params })
}

// ResetPassword 重置密码
export function ResetPassword(data: ResetPasswordRequest) {
  return request.post({ url: '/manager/api/user/password/reset', data })
}

// UpdateCurrentPassword 更新密码
export function UpdateCurrentUserPassword(data: UpdateCurrentUserPasswordRequest) {
  return request.post({ url: '/manager/api/current/user/password', data })
}

// OfflineUser 下线用户
export function OfflineUser(data: OfflineUserRequest) {
  return request.post({ url: '/manager/api/user/offline', data })
}

// UpdateUser 更新用户信息
export function UpdateCurrentUser(data: UpdateCurrentUserRequest) {
  return request.put({ url: '/manager/api/current/user', data })
}
