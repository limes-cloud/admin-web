export interface GetUserRequest {
  id?: number
  username?: string
}

export interface GetCurrentUserRequest {
  app?: string
}

export interface GetUserReply {
  id: number
  avatar: string
  username: string
  nickname: string
  status?: boolean
  loggedAt: number
  createdAt: number
  updatedAt: number
  setting: string
  infos: {
    field: string
    value: any
  }[]
}

export interface ListUserRequest {
  page: number
  pageSize: number
  app?: string
  deptId?: number
  jobId?: number
  username?: string
  status?: boolean
  loggedAts?: number[]
  createdAts?: number[]
}

export interface UserDept {
  dept: {
    id: number
    name: string
    main: boolean
  }
  job: {
    id: number
    name: string
  }
}

export interface User {
  id: number
  app?: string
  avatar: string
  username: string
  nickname: string
  status?: boolean
  userDepts: UserDept[]
  loggedAt: number
  createdAt: number
  updatedAt: number
}

export interface ListUserReply {
  total: number
  list: User[]
}

export interface CreateUserRequest {
  username: string
  nickname: string
  app?: string
  status?: boolean
}

export interface CreateUserReply {
  id: number
}

export interface UpdateUserRequest {
  id: number
  username?: string
  nickname?: string
  status?: boolean
  reason?: string
}

export interface UpdateCurrentUserRequest {
  nickname?: string
  avatar?: string
}

export interface DeleteUserRequest {
  id: number
}

export interface DeleteUserReply {
  total: number
}

export interface UpdateCurrentUserRequest {
  avatar?: string
  nickname?: string
}

export interface ResetUserPasswordRequest {
  id: number
}

export interface UpdateCurrentUserPasswordRequest {
  password: string
  oldPassword?: string
  // captchaId?: string
  // captcha?: string
}

export interface UpdateCurrentUserSettingRequest {
  app: string
  setting: string
}

export interface ResetPasswordRequest {
  id: number
}

export interface OfflineUserRequest {
  userId: number
  apps: string[]
}

export interface GetUserAppsRequest {
  userId: number
}

export interface UserApp {
  id: number
  keyword: string
  name: string
  logo: string
  status: boolean
  private: boolean
  loginable: boolean
  authorized: boolean
  denied: boolean
  canLogin: boolean
  authorizedAt: number
  loggedAt: number
  expiredAt: number
}

export interface GetUserAppsReply {
  list: UserApp[]
}

export interface UpdateUserAppsRequest {
  userId: number
  apps: string[]
  deniedApps: string[]
}
