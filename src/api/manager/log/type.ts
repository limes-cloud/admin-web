export interface ListLoginLogRequest {
  page: number
  pageSize: number
  username?: string
  createdAts?: number[]
}

export interface LoginLog {
  user: {
    id: number
    username: string
    nickname: string
    avatar: string
  }
  type: string
  ip: string
  address: string
  browser: string
  device: string
  code: number
  description: string
}

export interface ListLoginLogReply {
  total: number
  list: LoginLog[]
}

export interface ListAuthLogRequest {
  page: number
  pageSize: number
  username?: number
  createdAts?: number[]
}

export interface AuthLog {
  username: string
  api: string
  method: string
  name: string
  createdAt: number
}

export interface ListAuthLogReply {
  total: number
  list: AuthLog[]
}
