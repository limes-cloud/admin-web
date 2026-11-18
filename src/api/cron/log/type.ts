export interface GetLogRequest {
  id?: number
}

export interface GetLogReply {
  id: number
  uuid: string
  workerId: number
  workerSnapshot: string
  taskId: number
  taskSnapshot: string
  startAt: number
  endAt: number
  content: string
  status: string
}

export interface ListLogRequest {
  page: number
  pageSize: number
  taskId: number
  order?: string
  orderBy?: string
  uuid?: string
}

export interface Log {
  id: number
  uuid: string
  workerId: number
  workerSnapshot: string
  taskId: number
  taskSnapshot: string
  startAt: number
  endAt: number
  content: string
  status: string
}

export interface ListLogReply {
  total: number
  list: Log[]
}

export interface DeleteLogRequest {
  ids: number[]
}

export interface DeleteLogReply {
  total: number
}

export interface LogMsg {
  type: string
  content: string
  time: number
}

// 执行历史（一次触发）
export interface Execution {
  id: string
  taskId: number
  triggerAt: number
  triggerType: string
  workerId?: number
  status: string
  retryCount: number
  logUuid?: string
  startedAt?: number
  finishedAt?: number
  lastError?: string
  createdAt: number
}

export interface ListExecutionRequest {
  page: number
  pageSize: number
  taskId: number
  status?: string
  triggerType?: string
}

export interface ListExecutionReply {
  total: number
  list: Execution[]
}
