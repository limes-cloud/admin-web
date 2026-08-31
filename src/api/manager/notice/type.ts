export interface NoticeClassify {
  id: number
  name: string
  logo: string
  weight: number
  createdAt: number
  updatedAt: number
}

export interface ListNoticeClassifyReply {
  list: NoticeClassify[]
}

export interface CreateNoticeClassifyRequest {
  name: string
  logo: string
  weight: number
}

export interface CreateNoticeClassifyReply {
  id: number
}

export interface UpdateNoticeClassifyRequest {
  id: number
  name?: string
  logo?: string
  weight?: number
}

export interface DeleteNoticeClassifyRequest {
  id: number
}

export interface DeleteNoticeClassifyReply {
  total: number
}

export interface GetNoticeRequest {
  id: number
}

export interface ListNoticeRequest {
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  title?: string
  status?: boolean
  isTop?: boolean
  notRead?: boolean
  app?: string
}

export interface Notice {
  id: number
  classifyId: number
  app: string
  title: string
  description: string
  unit: string
  content?: string
  isTop?: boolean
  status?: boolean
  createdAt: number
  updatedAt: number
}

export interface ListNoticeReply {
  total: number
  list: Notice[]
}

export interface CreateNoticeRequest {
  classifyId: number
  app: string
  title: string
  description: string
  unit: string
  isTop?: boolean
}

export interface CreateNoticeReply {
  id: number
}

export interface UpdateNoticeRequest {
  id: number
  classifyId?: number
  app?: string
  title?: string
  description?: string
  unit?: string
  isTop?: boolean
  status?: boolean
}

export interface DeleteNoticeRequest {
  id: number
}

export interface DeleteNoticeReply {
  total: number
}
