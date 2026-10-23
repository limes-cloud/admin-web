export interface Resource {
  id: number
  title: string
  summary: string
  description: string
  categoryId: number
  tags: string
  score?: number | null
  cover: string
  viewCount: number
  transferCount: number
  weight: number
  isBanner: boolean
  status: number
  source: string
  createdAt: number
  updatedAt: number
}

export interface GetResourceRequest {
  id: number
}

export interface ListResourceRequest {
  page: number
  pageSize: number
  orderBy?: string
  order?: string
  categoryId?: number
  status?: number
  isBanner?: boolean
  keyword?: string
}

export interface ListResourceReply {
  list: Resource[]
  total: number
}

export interface CreateResourceRequest {
  title: string
  summary?: string
  description?: string
  categoryId: number
  tags?: string
  score?: number
  cover?: string
  weight?: number
  status?: number
}

export interface CreateResourceReply {
  id: number
}

export interface UpdateResourceRequest extends CreateResourceRequest {
  id: number
}

export interface DeleteResourceRequest {
  id: number
}

export interface UpdateResourceStatusRequest {
  id: number
  status: number
}

export interface UpdateResourceBannerRequest {
  id: number
  isBanner: boolean
}
