import request from '@/utils/http'

import {
  ListJobReply,
  ListJobRequest,
  CreateJobReply,
  CreateJobRequest,
  UpdateJobRequest,
  DeleteJobRequest
} from './type'

// ListJob 获取职位信息列表
export function ListJob(params: ListJobRequest) {
  return request.get<ListJobReply>({ url: '/manager/api/jobs', params })
}

// CreateJob 创建职位信息
export function CreateJob(data: CreateJobRequest) {
  return request.post<CreateJobReply>({ url: '/manager/api/job', data })
}

// UpdateJob 更新职位信息
export function UpdateJob(data: UpdateJobRequest) {
  return request.put({ url: '/manager/api/job', data })
}

// DeleteJob 删除职位信息
export function DeleteJob(params: DeleteJobRequest) {
  return request.del({ url: '/manager/api/job', params })
}
