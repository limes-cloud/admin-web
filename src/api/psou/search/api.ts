import request from '@/utils/http'

import {
  FilterAdFilesReply,
  FilterAdFilesRequest,
  ListSearchFileReply,
  ListSearchFileRequest,
  SearchResourcesReply,
  SearchResourcesRequest,
  SummarizeSelectionReply,
  SummarizeSelectionRequest,
  TransferSearchToAccountReply,
  TransferSearchToAccountRequest
} from './type'

// QuickSearchResources 从 pansou 同步检索已检测通过的资源，每个平台最多 10 条
export function QuickSearchResources(data: SearchResourcesRequest) {
  return request.post<SearchResourcesReply>({ url: '/psou/admin/search/quick', data, timeout: 60000 })
}

// ListSearchFile 获取检索结果的源文件树，用于确认来源后展示并回填文件信息
export function ListSearchFile(data: ListSearchFileRequest) {
  return request.post<ListSearchFileReply>({ url: '/psou/admin/search/files', data, timeout: 120000 })
}

// SummarizeSelection 汇总勾选文件的大小、文件数、文件夹数与格式统计
export function SummarizeSelection(data: SummarizeSelectionRequest) {
  return request.post<SummarizeSelectionReply>({ url: '/psou/admin/search/summarize', data, timeout: 120000 })
}

// FilterAdFiles 过滤广告文件并返回有效的最终路径
export function FilterAdFiles(data: FilterAdFilesRequest) {
  return request.post<FilterAdFilesReply>({ url: '/psou/admin/search/file/filter-ad', data })
}

// TransferSearchToAccount 按指定账号（或自动选号）转存分享并返回落地 fs_id
export function TransferSearchToAccount(data: TransferSearchToAccountRequest) {
  return request.post<TransferSearchToAccountReply>({ url: '/psou/admin/search/transfer', data, timeout: 120000 })
}
