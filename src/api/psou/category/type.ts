export interface Category {
  id: number
  parentId: number
  name: string
  icon: string
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
  sort?: number
  status?: number
  isHome?: boolean
}

export interface DeleteCategoryRequest {
  id: number
}
