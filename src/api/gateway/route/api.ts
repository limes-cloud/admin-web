import request from '@/utils/http'

import {
  type GatewayRoute,
  type HistoryItem,
  type ListRouteRequest,
  type Paginated,
  type PublishRequest,
  type RollbackRequest,
  type SaveRouteRequest
} from './type'

export function ListRoute(params: ListRouteRequest) {
  return request.get<Paginated<GatewayRoute>>({ url: '/gateway/api/routes', params })
}

export function CreateRoute(data: SaveRouteRequest) {
  return request.post<{ id: number }>({ url: '/gateway/api/routes', data })
}

export function UpdateRoute(id: number, data: SaveRouteRequest) {
  return request.put<{ id: number }>({ url: '/gateway/api/routes', data, params: { id } })
}

export function DeleteRoute(id: number) {
  return request.del<{ id: number }>({ url: '/gateway/api/routes', params: { id } })
}

export function Publish(data: PublishRequest) {
  return request.post<{ version: number }>({ url: '/gateway/api/publish', data })
}

export function Rollback(data: RollbackRequest) {
  return request.post<{ version: number }>({ url: '/gateway/api/publish/rollback', data })
}

export function ListHistory(params: { page: number; size: number }) {
  return request.get<Paginated<HistoryItem>>({ url: '/gateway/api/publish/history', params })
}
