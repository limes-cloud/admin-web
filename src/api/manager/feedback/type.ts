export interface ListFeedbackClassifyRequest {
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  name?: string
}

export interface FeedbackClassify {
  id: number
  name: string
  createdAt: number
  updatedAt: number
}

export interface ListFeedbackClassifyReply {
  total: number
  list: FeedbackClassify[]
}

export interface CreateFeedbackClassifyRequest {
  name: string
}

export interface CreateFeedbackClassifyReply {
  id: number
}

export interface UpdateFeedbackClassifyRequest {
  id: number
  name: string
}

export interface DeleteFeedbackClassifyRequest {
  id: number
}

export interface ListFeedbackRequest {
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  appId?: number
  categoryId?: number
  status?: string
  platform?: string
}

export interface App {
  id: number
  name: string
}

export interface User {
  id: number
  username: string
  nickname: string
}

export interface Feedback {
  id: number
  appId: number
  userId: number
  classifyId: number
  title: string
  content: string
  status: string
  images?: string
  imageUrls: string[]
  contact?: string
  device: string
  deviceInfo: any
  platform: string
  version: string
  processedBy?: number
  processedResult?: string
  createdAt: number
  updatedAt: number
  app?: App
  user?: User
  classify?: FeedbackClassify
}

export interface ListFeedbackReply {
  total: number
  list: Feedback[]
}

export interface CreateFeedbackRequest {
  appId: number
  categoryId: number
  title: string
  content: string
  images?: string
  imageUrls?: string[]
  device: string
  platform: string
  version: string
}

export interface CreateFeedbackReply {
  id: number
}

export interface DeleteFeedbackRequest {
  id: number
}

export interface UpdateFeedbackRequest {
  id: number
  status: string
  processedBy?: number
  processedResult?: string
}
