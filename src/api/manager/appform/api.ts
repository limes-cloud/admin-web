import request from '@/utils/http'

import {
  ListAppFormReply,
  ListAppFormRequest,
  CreateAppFormReply,
  CreateAppFormRequest,
  DeleteAppFormRequest
} from './type'

// ListAppForm 查询某应用下的表单关联列表
export function ListAppForm(params: ListAppFormRequest) {
  return request.get<ListAppFormReply>({ url: '/manager/api/form/app-forms', params })
}

// CreateAppForm 分配表单到应用
export function CreateAppForm(data: CreateAppFormRequest) {
  return request.post<CreateAppFormReply>({ url: '/manager/api/form/app-form', data })
}

// DeleteAppForm 取消分配
export function DeleteAppForm(params: DeleteAppFormRequest) {
  return request.del({ url: '/manager/api/form/app-form', params })
}
