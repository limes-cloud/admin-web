export interface Template {
  id: number
  app: string
  namespace: string
  version: string
  format: string
  description: string
  content: string
  compare: string
  isUse?: boolean
  createdAt: number
  updatedAt?: number
}

export interface SwitchTemplateRequest {
  app: string
  namespace?: string
  id: number
}

export interface CreateTemplateRequest {
  app: string
  namespace?: string
  description: string
  content: string
  format: string
}

export interface ParseTemplateRequest {
  content: string
  format: string
  envId: number
  app: string
  namespace?: string
}

export interface ParseTemplateReply {
  content: string
}

export interface ListTemplateRequest {
  app: string
  namespace?: string
  page: number
  pageSize: number
}

export interface ListTemplateReply {
  list: Template[]
  total: number
}

export interface ListTemplateNamespaceRequest {
  page: number
  pageSize: number
  app: string
  namespace?: string
  name?: string
}

export interface TemplateNamespace {
  id: number
  app: string
  namespace: string
  name: string
  description?: string
  sort: number
  createdAt: number
  updatedAt: number
}

export interface ListTemplateNamespaceReply {
  list: TemplateNamespace[]
}

export interface CreateTemplateNamespaceRequest {
  app: string
  namespace: string
  name: string
  description?: string
  sort: number
}

export interface CreateTemplateNamespaceReply {
  id: number
}

export interface UpdateTemplateNamespaceRequest {
  id: number
  namespace: string
  name: string
  description?: string
  sort: number
}

export interface DeleteTemplateNamespaceRequest {
  id: number
}

export interface CompareTemplateRequest {
  id: number
  format: string
  content: string
}

export interface CompareTemplateInfo {
  type: string
  key: string
  old: string
  cur: string
}

export interface CompareTemplateReply {
  list: CompareTemplateInfo[]
}
