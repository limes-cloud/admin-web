export interface ListSecretGroupRequest {
  page: number
  pageSize: number
  name?: string
  supplier?: string
}

export interface SecretGroup {
  id: number
  name: string
  host: string
  supplier?: string
  createdAt: number
  updatedAt: number
}

export interface ListSecretGroupReply {
  total: number
  list: SecretGroup[]
}

export interface CreateSecretGroupRequest {
  name: string
  host: string
  supplier: string
}

export interface CreateSecretGroupReply {
  id: number
}

export interface UpdateSecretGroupRequest {
  id: number
  name: string
  host: string
  supplier: string
}

export interface DeleteSecretGroupRequest {
  id: number
}

export interface DeleteSecretGroupReply {
  total: number
}

export interface ListSecretRequest {
  page: number
  pageSize: number
  name?: string
  groupId?: number
}

export interface Secret {
  id: number
  groupId: number
  token: string
  status: boolean
  reason?: string
  description?: string
  createdAt: number
  updatedAt: number
  group: SecretGroup
}

export interface ListSecretReply {
  total: number
  list: Secret[]
}

export interface CreateSecretRequest {
  groupId: number
  token: string
  description?: string
}

export interface CreateSecretReply {
  id: number
}

export interface UpdateSecretRequest {
  id: number
  groupId?: number
  token?: string
  status?: boolean
  description?: string
}

export interface DeleteSecretRequest {
  id: number
}

export interface DeleteSecretReply {
  total: number
}
