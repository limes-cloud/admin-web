import { Model } from '../model/type'

export interface ListPromptClassifyRequest {
  page: number
  pageSize: number
  name?: string
}

export interface PromptClassify {
  id: number
  name: string
  description: string
  createdAt: number
  updatedAt: number
}

export interface ListPromptClassifyReply {
  total: number
  list: PromptClassify[]
}

export interface CreatePromptClassifyRequest {
  name: string
  description: string
}

export interface CreatePromptClassifyReply {
  id: number
}

export interface UpdatePromptClassifyRequest {
  id: number
  name: string
  description: string
}

export interface DeletePromptClassifyRequest {
  id: number
}

export interface DeletePromptClassifyReply {
  total: number
}

export interface ListPromptRequest {
  page: number
  pageSize: number
  name?: string
  groupId?: number
}

export interface Prompt {
  id: number
  classifyId: number
  modelId: number
  uuid: string
  title: string
  system: string
  prompt: string
  description: string
  extra: string
  extraObject: any
  status: number
  formatJson: boolean
  outputSchema: string
  secretGroupId: number
  model: Model
  classify: PromptClassify
  createdAt: number
  updatedAt: number
}

export interface ListPromptReply {
  total: number
  list: Prompt[]
}

export interface CreatePromptRequest {
  classifyId: number
  modelId: number
  uuid: string
  title: string
  system: string
  prompt: string
  description: string
  extra: string
  formatJson: boolean
  outputSchema: string
}

export interface CreatePromptReply {
  id: number
}

export interface UpdatePromptRequest {
  id: number
  classifyId: number
  modelId: number
  title: string
  system: string
  prompt: string
  status: number
  description: string
  extra: string
  formatJson: boolean
  outputSchema: string
}

export interface DeletePromptRequest {
  id: number
}

export interface DeletePromptReply {
  total: number
}
