import request from '@/utils/http'
import {
  Template,
  CreateTemplateRequest,
  ParseTemplateRequest,
  ParseTemplateReply,
  SwitchTemplateRequest,
  CompareTemplateRequest,
  CompareTemplateReply,
  ListTemplateRequest,
  ListTemplateReply
} from './type'

export function CurrentTemplate(serverId: number) {
  return request.get<Template>({ url: '/configure/api/template/current', params: { serverId } })
}

export function SwitchTemplate(data: SwitchTemplateRequest) {
  return request.post<Template>({ url: '/configure/api/template/switch', data })
}

export function CreateTemplate(data: CreateTemplateRequest) {
  return request.post({ url: '/configure/api/template', data })
}

export function ParseTemplate(data: ParseTemplateRequest) {
  return request.post<ParseTemplateReply>({ url: '/configure/api/template/preview', data })
}

export function GetTemplate(id: number) {
  return request.get<Template>({ url: '/configure/api/template', params: { id } })
}

export function ListTemplate(params: ListTemplateRequest) {
  return request.get<ListTemplateReply>({ url: '/configure/api/templates', params })
}

export function CompareTemplate(data: CompareTemplateRequest) {
  return request.post<CompareTemplateReply>({ url: '/configure/api/template/compare', data })
}
