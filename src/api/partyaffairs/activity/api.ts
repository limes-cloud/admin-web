import request from '@/utils/http'
import {
  ListActivityRequest,
  ListActivityReply,
  CreateActivityRequest,
  CreateActivityReply,
  UpdateActivityRequest,
  DeleteActivityRequest,
  GetActivityRequest,
  Activity
} from './type'

// ListActivity 获取活动信息列表
export function GetActivity(params: GetActivityRequest) {
  return request.get<Activity>({ url: '/manager/api/activity', params })
}

// ListActivity 获取活动信息列表
export function ListActivity(params: ListActivityRequest) {
  return request.get<ListActivityReply>({ url: '/manager/api/activitys', params })
}

// CreateActivity 创建活动信息
export function CreateActivity(data: CreateActivityRequest) {
  return request.post<CreateActivityReply>({ url: '/manager/api/activity', data })
}

// UpdateActivity 更新活动信息
export function UpdateActivity(data: UpdateActivityRequest) {
  return request.put({ url: '/manager/api/activity', data })
}

// DeleteActivity 删除活动信息
export function DeleteActivity(params: DeleteActivityRequest) {
  return request.del({ url: '/manager/api/activity', params })
}
