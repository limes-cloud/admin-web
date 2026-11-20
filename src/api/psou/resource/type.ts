export interface Resource {
  id: number
  title: string
  summary: string
  description: string
  categoryId: number
  tags: string[]
  score: number
  cover: string
  preview: string[]
  manual: string
  viewCount: number
  clickCount: number
  weight: number
  isBanner: boolean
  bannerFocusX: number
  bannerFocusY: number
  status: number
  source: string
  createdAt: number
  updatedAt: number
}

export interface GetResourceRequest {
  id: number
}

export interface GetResourceReply {
  resource: Resource
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
  summary: string
  description: string
  categoryId: number
  tags: string[]
  score: number
  cover: string
  preview: string[]
  manual: string
  weight?: number
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

export interface UpdateResourceBannerFocusRequest {
  id: number
  x: number
  y: number
}

export interface FetchResourceMetadataRequest {
  title: string
  type?: 'auto' | 'movie' | 'tv' | 'book'
}

export interface ResourceMetadata {
  title: string
  summary: string
  description: string
  tags: string[]
  score: number
  year: string
  kind: string
  source: string
  sourceUrl: string
  covers: string[]
  coverError?: string
}

export interface FetchResourceMetadataReply {
  metadata: ResourceMetadata
}
