import request from '@/utils/http'

import {
  ListUserFormReply,
  ListUserFormRequest,
  GetUserFormReply,
  GetUserFormRequest,
  GetUserFormByAppReply,
  GetUserFormByAppRequest,
  CreateUserFormReply,
  CreateUserFormRequest,
  UpdateUserFormRequest,
  PublishUserFormRequest,
  DeleteUserFormRequest
} from './type'

// ListUserForm 分页查询表单列表
export function ListUserForm(params: ListUserFormRequest) {
  return request.get<ListUserFormReply>({ url: '/manager/api/form/user-forms', params })
}

// GetUserForm 获取单个表单
export function GetUserForm(params: GetUserFormRequest) {
  return request.get<GetUserFormReply>({ url: '/manager/api/form/user-form', params })
}

// GetUserFormByApp 通过应用和场景获取表单（运行时用）
export function GetUserFormByApp(params: GetUserFormByAppRequest) {
  return request.get<GetUserFormByAppReply>({ url: '/manager/api/form/user-form/by-app', params })
}

// CreateUserForm 创建表单
export function CreateUserForm(data: CreateUserFormRequest) {
  return request.post<CreateUserFormReply>({ url: '/manager/api/form/user-form', data })
}

// UpdateUserForm 更新表单
export function UpdateUserForm(data: UpdateUserFormRequest) {
  return request.put({ url: '/manager/api/form/user-form', data })
}

// PublishUserForm 发布表单
export function PublishUserForm(data: PublishUserFormRequest) {
  return request.put({ url: '/manager/api/form/user-form/publish', data })
}

// DeleteUserForm 删除表单
export function DeleteUserForm(params: DeleteUserFormRequest) {
  return request.del({ url: '/manager/api/form/user-form', params })
}
