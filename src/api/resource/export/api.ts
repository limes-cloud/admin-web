import request from '@/utils/http'
import {
  GetExportReply,
  GetExportRequest,
  ListExportReply,
  ListExportRequest,
  DeleteExportReply,
  DeleteExportRequest,
  ExportFileRequest,
  ExportFileReply
} from './type'

// GetExport 获取指定的文件目录信息
export function GetExport(params?: GetExportRequest) {
  return request.get<GetExportReply>({ url: '/resource/api/export', params })
}

// ListExport 获取文件目录信息列表
export function ListExport(params: ListExportRequest) {
  return request.get<ListExportReply>({ url: '/resource/api/directories', params })
}

// ExportFile 创建文件目录信息
export function ExportFile(data: ExportFileRequest) {
  return request.post<ExportFileReply>({ url: '/resource/api/export', data })
}

// DeleteExport 删除文件目录信息
export function DeleteExport(params: DeleteExportRequest) {
  return request.del<DeleteExportReply>({ url: '/resource/api/export', params })
}
