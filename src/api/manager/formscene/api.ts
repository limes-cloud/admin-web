import request from '@/utils/http'

import {
  ListFormSceneReply,
  ListFormSceneRequest,
  CreateFormSceneReply,
  CreateFormSceneRequest,
  UpdateFormSceneRequest,
  DeleteFormSceneRequest
} from './type'

// ListFormScene 查询场景列表
export function ListFormScene(params: ListFormSceneRequest) {
  return request.get<ListFormSceneReply>({ url: '/manager/api/form/scenes', params })
}

// CreateFormScene 创建场景
export function CreateFormScene(data: CreateFormSceneRequest) {
  return request.post<CreateFormSceneReply>({ url: '/manager/api/form/scene', data })
}

// UpdateFormScene 更新场景
export function UpdateFormScene(data: UpdateFormSceneRequest) {
  return request.put({ url: '/manager/api/form/scene', data })
}

// DeleteFormScene 删除场景
export function DeleteFormScene(params: DeleteFormSceneRequest) {
  return request.del({ url: '/manager/api/form/scene', params })
}
