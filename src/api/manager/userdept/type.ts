export interface Job {
  id: number
  name: string
}

export interface Dept {
  id: number
  name: string
  keyword: string
}

export interface ListUserDeptRequest {
  page: number
  pageSize: number
  name?: string
  userId: number
  app?: string
}

export interface Dept {
  id: number
  name: string
}

export interface UserDept {
  id: number
  userId: number
  dept: Dept
  job: Job
  main: boolean
  createdAt: number
  updatedAt: number
}

export interface ListUserDeptReply {
  total: number
  list: UserDept[]
}

export interface CreateUserDeptRequest {
  userId: number
  deptId: number
  jobId: number
  main: boolean
  app?: string
}

export interface UpdateUserDeptRequest {
  id: number
  deptId?: number
  jobId?: number
  main?: boolean
  app?: string
}

export interface DeleteUserDeptRequest {
  id: number
  app?: string
}
