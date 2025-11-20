import request from '@/utils/http'
import {
  ListDeptRequest,
  ListDeptReply,
  CreateDeptRequest,
  CreateDeptReply,
  UpdateDeptRequest,
  DeleteDeptRequest,
  ListDeptClassifyRequest,
  CreateDeptClassifyReply,
  CreateDeptClassifyRequest,
  DeleteDeptClassifyRequest,
  ListDeptClassifyReply,
  UpdateDeptClassifyRequest
} from './type'

// ListDept 获取当前可见部门信息列表
export function ListCurrentDept(params?: ListDeptRequest) {
  return request.get<ListDeptReply>({ url: '/manager/api/depts/current', params })
}

// ListDept 获取部门信息列表
export function ListDept(params?: ListDeptRequest) {
  return request.get<ListDeptReply>({ url: '/manager/api/depts', params })
}

// CreateDept 创建部门信息
export function CreateDept(data: CreateDeptRequest) {
  return request.post<CreateDeptReply>({ url: '/manager/api/dept', data })
}

// UpdateDept 更新部门信息
export function UpdateDept(data: UpdateDeptRequest) {
  return request.put({ url: '/manager/api/dept', data })
}

// DeleteDept 删除部门信息
export function DeleteDept(params: DeleteDeptRequest) {
  return request.del({ url: '/manager/api/dept', params })
}

// ListDeptClassify 获取部门类型信息列表
export function ListDeptClassify(params: ListDeptClassifyRequest) {
  return request.get<ListDeptClassifyReply>({ url: '/manager/api/dept/classifies', params })
}

// CreateDeptClassify 创建部门类型信息
export function CreateDeptClassify(data: CreateDeptClassifyRequest) {
  return request.post<CreateDeptClassifyReply>({ url: '/manager/api/dept/classify', data })
}

// UpdateDeptClassify 更新部门类型信息
export function UpdateDeptClassify(data: UpdateDeptClassifyRequest) {
  return request.put({ url: '/manager/api/dept/classify', data })
}

// DeleteDeptClassify 删除部门类型信息
export function DeleteDeptClassify(params: DeleteDeptClassifyRequest) {
  return request.del({ url: '/manager/api/dept/classify', params })
}
