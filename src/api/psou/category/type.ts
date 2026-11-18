export interface Category {
  id: number
  parentId: number
  name: string
  /** 上传图片的对象 key，或完整的 HTTP(S) 图片地址 */
  icon: string
  /** 图标主色，形如 #2463eb */
  iconColor: string
  sort: number
  status: number
  isHome: boolean
  createdAt: number
  updatedAt: number
  children?: Category[]
}

export interface ListCategoryRequest {
  parentId?: number
  status?: number
  name?: string
}

export interface ListCategoryReply {
  list: Category[]
  total: number
}

export interface CreateCategoryRequest {
  parentId: number
  name: string
  icon?: string
  iconColor?: string
  sort?: number
  status?: number
  isHome?: boolean
}

export interface CreateCategoryReply {
  id: number
}

export interface UpdateCategoryRequest {
  id: number
  parentId: number
  name: string
  icon?: string
  iconColor?: string
  sort?: number
  status?: number
  isHome?: boolean
}

export interface DeleteCategoryRequest {
  id: number
}
