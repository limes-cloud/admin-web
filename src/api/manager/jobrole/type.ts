export interface ListJobRoleRequest {
  page: number
  pageSize: number
  name?: string
  jobId: number
  app?: string
}

export interface Role {
  id: number
  keyword: string
  name: string
}

export interface ListJobRoleReply {
  total: number
  list: Role[]
}

export interface CreateJobRoleRequest {
  jobId: number
  roleId: number
  app?: string
}

export interface CreateJobRoleReply {
  id: number
}

export interface DeleteJobRoleRequest {
  jobId: number
  roleId: number
  app?: string
}
