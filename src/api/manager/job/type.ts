export interface ListJobRequest {
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  keyword?: string
  name?: string
  app?: string
}

export interface Job {
  id: number
  app?: string
  keyword: string
  name: string
  weight?: number
  description?: string
  status?: boolean
  createdAt: number
  updatedAt: number
}

export interface ListJobReply {
  total: number
  list: Job[]
}

export interface CreateJobRequest {
  app?: string
  keyword: string
  name: string
  weight?: number
  description?: string
}

export interface CreateJobReply {
  id: number
}

export interface UpdateJobRequest {
  id: number
  app?: string
  keyword?: string
  name?: string
  weight?: number
  status?: boolean
  description?: string
}

export interface DeleteJobRequest {
  id: number
  app?: string
}

export interface DeleteJobReply {
  total: number
}
