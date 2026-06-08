import request from '@/utils/http'
import { CompareConfigureRequest, CompareConfigureReply, SyncConfigureRequest } from './type'

export function SyncConfigure(data: SyncConfigureRequest) {
  return request.put({ url: '/configure/api/configure', data })
}

export function CompareConfigure(data: CompareConfigureRequest) {
  return request.post<CompareConfigureReply>({ url: '/configure/api/configure/compare', data })
}
