export interface ListEnvRequest {
  keyword?: string
  name?: string
  status?: boolean
}

export interface Env {
  id: number
  keyword: string
  name: string
  status?: boolean
  description?: string
  createdAt: number
  updatedAt: number
}

export interface ListEnvReply {
  total: number
  list: Env[]
}

export interface CreateEnvRequest {
  keyword: string
  name: string
  status?: boolean
  description?: string
}

export interface CreateEnvReply {
  id: number
}

export interface UpdateEnvRequest {
  id: number
  keyword?: string
  name?: string
  status?: boolean
  description?: string
}

export interface DeleteEnvRequest {
  id: number
}
