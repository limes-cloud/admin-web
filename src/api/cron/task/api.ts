import request from '@/utils/http'
import {
  GetTaskReply,
  GetTaskRequest,
  ListTaskReply,
  ListTaskRequest,
  CreateTaskReply,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  DeleteTaskRequest,
  GetTaskGroupRequest,
  GetTaskGroupReply,
  ListTaskGroupRequest,
  ListTaskGroupReply,
  CreateTaskGroupRequest,
  CreateTaskGroupReply,
  UpdateTaskGroupRequest,
  DeleteTaskGroupRequest,
  CancelTaskRequest,
  ExecTaskRequest
} from './type'

export function GetTaskGroup(params: GetTaskGroupRequest) {
  return request.get<GetTaskGroupReply>({ url: '/cron/api/v1/task_group', params })
}

export function ListTaskGroup(params: ListTaskGroupRequest) {
  return request.get<ListTaskGroupReply>({ url: '/cron/api/v1/task_groups', params })
}

export function CreateTaskGroup(data: CreateTaskGroupRequest) {
  return request.post<CreateTaskGroupReply>({ url: '/cron/api/v1/task_group', data })
}

export function UpdateTaskGroup(data: UpdateTaskGroupRequest) {
  return request.put({ url: '/cron/api/v1/task_group', data })
}

export function DeleteTaskGroup(params: DeleteTaskGroupRequest) {
  return request.del({ url: '/cron/api/v1/task_group', params })
}

export function GetTask(params?: GetTaskRequest) {
  return request.get<GetTaskReply>({ url: '/cron/api/v1/task', params })
}

export function ListTask(params: ListTaskRequest) {
  return request.get<ListTaskReply>({ url: '/cron/api/v1/tasks', params })
}

export function CreateTask(data: CreateTaskRequest) {
  return request.post<CreateTaskReply>({ url: '/cron/api/v1/task', data })
}

export function UpdateTask(data: UpdateTaskRequest) {
  return request.put({ url: '/cron/api/v1/task', data })
}

export function UpdateTaskStatus(data: UpdateTaskStatusRequest) {
  return request.put({ url: '/cron/api/v1/task/status', data })
}

export function DeleteTask(params: DeleteTaskRequest) {
  return request.del({ url: '/cron/api/v1/task', params })
}

export function ExecTask(data: ExecTaskRequest) {
  return request.post({ url: '/cron/api/v1/task/exec', data })
}

export function CancelTask(data: CancelTaskRequest) {
  return request.post({ url: '/cron/api/v1/task/cancel', data })
}
