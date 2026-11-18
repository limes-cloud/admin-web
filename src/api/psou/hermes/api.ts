import request from '@/utils/http'

import type {
  HermesDeviceListReply,
  HermesDeviceRevokeRequest,
  HermesSK,
  HermesSKCreateRequest,
  HermesSKListReply,
  HermesSKListRequest,
  HermesSKStatusRequest,
  HermesTransferListReply,
  HermesTransferListRequest
} from './type'

// ListHermesSK 查询 Hermes SK 列表
export function ListHermesSK(params: HermesSKListRequest) {
  return request.get<HermesSKListReply>({ url: '/psou/admin/hermes/sks', params })
}

// CreateHermesSK 生成 Hermes SK。
export function CreateHermesSK(data: HermesSKCreateRequest) {
  return request.post<HermesSK>({ url: '/psou/admin/hermes/sk', data })
}

// UpdateHermesSKStatus 启用或禁用 SK。
export function UpdateHermesSKStatus(data: HermesSKStatusRequest) {
  return request.put({ url: '/psou/admin/hermes/sk/status', data })
}

// ListHermesDevice 查询 SK 的设备绑定。
export function ListHermesDevice(params: { sk: string }) {
  return request.get<HermesDeviceListReply>({ url: '/psou/admin/hermes/sk/devices', params })
}

// RevokeHermesDevice 撤销单个设备绑定。
export function RevokeHermesDevice(data: HermesDeviceRevokeRequest) {
  return request.post({ url: '/psou/admin/hermes/sk/device/revoke', data })
}

// ListHermesTransfer 查询转存记录；不传 sk 时返回全部。
export function ListHermesTransfer(params: HermesTransferListRequest) {
  return request.get<HermesTransferListReply>({ url: '/psou/admin/hermes/sk/transfers', params })
}
