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
  ListTemplateReply,
  ListTemplateNamespaceRequest,
  ListTemplateNamespaceReply,
  CreateTemplateNamespaceRequest,
  CreateTemplateNamespaceReply,
  UpdateTemplateNamespaceRequest,
  DeleteTemplateNamespaceRequest
} from './type'

export function CurrentTemplate(app: string, namespace?: string, showErrorMessage = true) {
  return request.get<Template>({
    url: '/configure/api/template/current',
    params: { app, namespace },
    showErrorMessage
  })
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

export function ListTemplateNamespace(params: ListTemplateNamespaceRequest) {
  return request.get<ListTemplateNamespaceReply>({ url: '/configure/api/template/namespaces', params })
}

export function CreateTemplateNamespace(data: CreateTemplateNamespaceRequest) {
  return request.post<CreateTemplateNamespaceReply>({ url: '/configure/api/template/namespace', data })
}

export function UpdateTemplateNamespace(data: UpdateTemplateNamespaceRequest) {
  return request.put({ url: '/configure/api/template/namespace', data })
}

export function DeleteTemplateNamespace(params: DeleteTemplateNamespaceRequest) {
  return request.del({ url: '/configure/api/template/namespace', params })
}

export function CompareTemplate(data: CompareTemplateRequest) {
  return request.post<CompareTemplateReply>({ url: '/configure/api/template/compare', data })
}
