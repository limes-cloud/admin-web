import request from '@/utils/http'
import {
  GetWorkerGroupReply,
  GetWorkerGroupRequest,
  ListWorkerGroupReply,
  ListWorkerGroupRequest,
  CreateWorkerGroupReply,
  CreateWorkerGroupRequest,
  UpdateWorkerGroupRequest,
  DeleteWorkerGroupRequest,
  CreateWorkerRequest,
  CreateWorkerReply,
  UpdateWorkerRequest,
  UpdateWorkerStatusRequest,
  DeleteWorkerRequest,
  ListWorkerRequest,
  ListWorkerReply,
  GetWorkerRequest,
  GetWorkerReply
} from './type'

export function GetWorkerGroup(params?: GetWorkerGroupRequest) {
  return request.get<GetWorkerGroupReply>({ url: '/cron/api/v1/worker_group', params })
}

export function ListWorkerGroup(params: ListWorkerGroupRequest) {
  return request.get<ListWorkerGroupReply>({ url: '/cron/api/v1/worker_groups', params })
}

export function CreateWorkerGroup(data: CreateWorkerGroupRequest) {
  return request.post<CreateWorkerGroupReply>({ url: '/cron/api/v1/worker_group', data })
}

export function UpdateWorkerGroup(data: UpdateWorkerGroupRequest) {
  return request.put({ url: '/cron/api/v1/worker_group', data })
}

export function DeleteWorkerGroup(params: DeleteWorkerGroupRequest) {
  return request.del({ url: '/cron/api/v1/worker_group', params })
}

export function GetWorker(params: GetWorkerRequest) {
  return request.get<GetWorkerReply>({ url: '/cron/api/v1/worker', params })
}

export function ListWorker(params: ListWorkerRequest) {
  return request.get<ListWorkerReply>({ url: '/cron/api/v1/workers', params })
}

export function CreateWorker(data: CreateWorkerRequest) {
  return request.post<CreateWorkerReply>({ url: '/cron/api/v1/worker', data })
}

export function UpdateWorker(data: UpdateWorkerRequest) {
  return request.put({ url: '/cron/api/v1/worker', data })
}

export function UpdateWorkerStatus(data: UpdateWorkerStatusRequest) {
  return request.put({ url: '/cron/api/v1/worker/status', data })
}

export function DeleteWorker(params: DeleteWorkerRequest) {
  return request.del({ url: '/cron/api/v1/worker', params })
}
