import request from '@/utils/http'

import {
  ListAppOAutherReply,
  ListAppOAutherRequest,
  CreateAppOAutherReply,
  CreateAppOAutherRequest,
  DeleteAppOAutherRequest
} from './type'

// ListAppOAuther 获取应用授权信息列表
export function ListAppOAuther(params: ListAppOAutherRequest) {
  return request.get<ListAppOAutherReply>({ url: '/manager/api/app/oauthers', params })
}

// CreateAppOAuther 创建应用授权信息
export function CreateAppOAuther(data: CreateAppOAutherRequest) {
  return request.post<CreateAppOAutherReply>({ url: '/manager/api/app/oauther', data })
}

// DeleteAppOAuther 删除应用授权信息
export function DeleteAppOAuther(params: DeleteAppOAutherRequest) {
  return request.del({ url: '/manager/api/app/oauther', params })
}
