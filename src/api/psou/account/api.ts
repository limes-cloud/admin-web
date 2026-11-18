import request from '@/utils/http'
import { useUserStore } from '@/store/modules/user'
import { getAppKeyword } from '@/utils/app-context'
import { getAPIBaseURL } from '@/utils/runtime-config'

import {
  CreateAccountDirReply,
  CreateAccountDirRequest,
  CreateAccountQRSessionReply,
  CreateAccountQRSessionRequest,
  CreateAccountReply,
  CreateAccountRequest,
  DeleteAccountFileRequest,
  DeleteAccountRequest,
  GetAccountShareStatsReply,
  GetAccountShareStatsRequest,
  GetAccountReply,
  GetAccountRequest,
  GetAccountQRSessionReply,
  GetAccountQRSessionRequest,
  ListAccountFileReply,
  ListAccountFileRequest,
  ListAccountReply,
  ListAccountRequest,
  MoveAccountFileReply,
  MoveAccountFileRequest,
  ProbeAccountRequest,
  ProbeAndRecoverAccountRequest,
  QuickTransferAccountFileReply,
  QuickTransferAccountFileRequest,
  RefreshAccountStorageRequest,
  RenameAccountFileRequest,
  ShareAccountFileReply,
  ShareAccountFileRequest,
  UInt64Value,
  UnzipAccountFileReply,
  UnzipAccountFileRequest,
  UploadAccountFileReply,
  UpdateAccountRequest
} from './type'

// GetAccount 获取网盘账号详情
export function GetAccount(params: GetAccountRequest) {
  return request.get<GetAccountReply>({ url: '/psou/admin/account', params })
}

// ListAccount 获取网盘账号列表
export function ListAccount(params: ListAccountRequest) {
  return request.get<ListAccountReply>({ url: '/psou/admin/accounts', params })
}

// CreateAccount 创建网盘账号
export function CreateAccount(data: CreateAccountRequest) {
  return request.post<CreateAccountReply>({ url: '/psou/admin/account', data })
}

// UpdateAccount 更新网盘账号
export function UpdateAccount(data: UpdateAccountRequest) {
  return request.put({ url: '/psou/admin/account', data })
}

// DeleteAccount 删除网盘账号
export function DeleteAccount(params: DeleteAccountRequest) {
  return request.del({ url: '/psou/admin/account', params })
}

// ProbeAccount 探测网盘账号登录态
export function ProbeAccount(data: ProbeAccountRequest) {
  return request.post({ url: '/psou/admin/account/probe', data })
}

// ProbeAndRecoverAccount 手工触发限流账号恢复检测
export function ProbeAndRecoverAccount(data: ProbeAndRecoverAccountRequest) {
  return request.post({ url: '/psou/admin/account/probe-recover', data })
}

// RefreshAccountStorage 刷新网盘账号容量
export function RefreshAccountStorage(data: RefreshAccountStorageRequest) {
  return request.post({ url: '/psou/admin/account/storage/refresh', data })
}

// CreateAccountQRSession 创建账号扫码登录会话
export function CreateAccountQRSession(data: CreateAccountQRSessionRequest) {
  return request.post<CreateAccountQRSessionReply>({ url: '/psou/admin/account/qr/session', data })
}

// GetAccountQRSession 查询账号扫码登录状态
export function GetAccountQRSession(params: GetAccountQRSessionRequest) {
  return request.get<GetAccountQRSessionReply>({ url: '/psou/admin/account/qr/session', params })
}

// ListAccountFile 列举账号网盘目录
export function ListAccountFile(params: ListAccountFileRequest) {
  return request.get<ListAccountFileReply>({ url: '/psou/admin/account/files', params })
}

// CreateAccountDir 新建账号网盘目录
export function CreateAccountDir(data: CreateAccountDirRequest) {
  return request.post<CreateAccountDirReply>({ url: '/psou/admin/account/file/dir', data })
}

// RenameAccountFile 重命名账号网盘文件或目录
export function RenameAccountFile(data: RenameAccountFileRequest) {
  return request.put({ url: '/psou/admin/account/file', data })
}

// MoveAccountFile 移动账号网盘文件到指定目录
export function MoveAccountFile(data: MoveAccountFileRequest) {
  return request.post<MoveAccountFileReply>({ url: '/psou/admin/account/file/move', data })
}

// ShareAccountFile 为账号网盘中的单个文件或目录创建分享
export function ShareAccountFile(data: ShareAccountFileRequest) {
  return request.post<ShareAccountFileReply>({ url: '/psou/admin/account/file/share', data })
}

// GetAccountShareStats 获取指定分享的访问、下载、保存统计
export function GetAccountShareStats(params: GetAccountShareStatsRequest) {
  return request.get<GetAccountShareStatsReply>({ url: '/psou/admin/account/share/stats', params })
}

// DeleteAccountFile 删除账号网盘文件或目录
export function DeleteAccountFile(params: DeleteAccountFileRequest) {
  return request.del({ url: '/psou/admin/account/file', params })
}

// UnzipAccountFile 在线解压账号网盘压缩包
export function UnzipAccountFile(data: UnzipAccountFileRequest) {
  return request.post<UnzipAccountFileReply>({
    url: '/psou/admin/account/file/unzip',
    data,
    timeout: 5 * 60 * 1000
  })
}

// UploadAccountFile 上传文件到真实网盘，progress 为 0-100
export function UploadAccountFile(data: FormData, onProgress?: (percent: number) => void) {
  return request.post<UploadAccountFileReply>({
    url: '/psou/admin/account/file/upload',
    data,
    timeout: 5 * 60 * 1000,
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)))
    }
  })
}

// QuickTransferAccountFile 把分享链接整包转存到账号指定目录
export function QuickTransferAccountFile(data: QuickTransferAccountFileRequest) {
  return request.post<QuickTransferAccountFileReply>({
    url: '/psou/admin/account/file/transfer',
    data,
    timeout: 2 * 60 * 1000
  })
}

// DownloadAccountFile 通过服务端代理下载真实网盘文件
export async function DownloadAccountFile(params: {
  accountId: UInt64Value
  fsId: string
  path?: string
  name: string
  range?: string
}): Promise<{ blob: Blob; filename: string; contentRange: string }> {
  const query = new URLSearchParams({
    accountId: String(params.accountId),
    fsId: params.fsId,
    path: params.path || '',
    name: params.name
  })
  const { accessToken } = useUserStore()
  const response = await fetch(`${getAPIBaseURL()}/psou/admin/account/file/download?${query.toString()}`, {
    headers: {
      ...(accessToken ? { Authorization: accessToken } : {}),
      'X-App-Key': getAppKeyword(),
      ...(params.range ? { Range: params.range } : {})
    }
  })
  if (!response.ok) {
    let message = `下载失败（${response.status}）`
    try {
      const body = await response.json()
      message = body?.message || body?.msg || message
    } catch {
      // 非 JSON 错误响应时保留状态码文案
    }
    throw new Error(message)
  }
  return {
    blob: await response.blob(),
    filename: params.name || 'download',
    contentRange: response.headers.get('Content-Range') || ''
  }
}
