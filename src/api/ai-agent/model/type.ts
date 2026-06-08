import { SecretGroup } from '../secret/type'

export interface ListModelRequest {
  page: number
  pageSize: number
  type?: string
  name?: string
  secretGroupId?: number
}

export interface ModelExtra {
  supportJson?: boolean
  supportTool?: boolean
}

export interface Model {
  id: number
  type: string
  name: string
  keyword: string
  secretGroupId: number
  description: string
  secretGroup: SecretGroup
  extra: string
  extraObject: ModelExtra
  createdAt: number
  updatedAt: number
}

export interface ListModelReply {
  total: number
  list: Model[]
}

export interface CreateModelRequest {
  type: string
  name: string
  keyword: string
  secretGroupId: number
  description: string
  secretGroup: SecretGroup
  extra: string
}

export interface CreateModelReply {
  id: number
}

export interface UpdateModelRequest {
  id: number
  type?: string
  name?: string
  keyword?: string
  secretGroupId?: number
  description?: string
  secretGroup?: SecretGroup
  extra?: string
}

export interface DeleteModelRequest {
  id: number
}

export interface DeleteModelReply {
  total: number
}
