export interface ListDeptClassifyRequest {
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  name?: string
}

export interface DeptClassify {
  id: number
  name: string
  description?: string
  createdAt: number
  updatedAt: number
}

export interface ListDeptClassifyReply {
  total: number
  list: DeptClassify[]
}

export interface CreateDeptClassifyRequest {
  name: string
  description?: string
}

export interface CreateDeptClassifyReply {
  id: number
}

export interface UpdateDeptClassifyRequest {
  id: number
  name: string
  description?: string
}

export interface DeleteDeptClassifyRequest {
  id: number
}

export interface DeleteDeptClassifyReply {
  total: number
}

export interface ListDeptRequest {
  name?: string
  keyword?: string
  classifyId?: number
}

export interface Dept {
  id: number
  parentId: number
  parent?: Dept
  classifyId: number
  name: string
  keyword: string
  logo: string
  status: boolean
  description?: string
  createdAt: number
  updatedAt: number
  classify: DeptClassify
  children: Dept[]
}

export interface ListDeptReply {
  total: number
  list: Dept[]
}

export interface CreateDeptRequest {
  classifyId: number
  parentId: number
  name: string
  keyword: string
  logo: string
  description?: string
}

export interface CreateDeptReply {
  id: number
}

export interface UpdateDeptRequest {
  id: number
  classifyId?: number
  parentId?: number
  name?: string
  logo?: string
  status?: boolean
  description?: string
}

export interface DeleteDeptRequest {
  id: number
}

export interface DeleteDeptReply {
  total: number
}
