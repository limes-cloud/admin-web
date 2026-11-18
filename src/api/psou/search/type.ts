export interface SearchResourceItem {
  platform: string
  title: string
  token: string
  source: string
}

export interface SearchResourcesRequest {
  keyword: string
}

export interface SearchResourcesReply {
  list: SearchResourceItem[]
}

export interface TransferFileItem {
  fsId: string
  name: string
  isDir: boolean
  size: number
  path: string
  hasChildren: boolean
  children?: TransferFileItem[]
  disabled?: boolean
  isPlaceholder?: boolean
}

export interface ListSearchFileRequest {
  token?: string
  shareMeta?: string
  dirFsId?: string
  dirPath?: string
  platform?: string
  shareUrl?: string
  password?: string
  flat?: boolean
  filterByFileTypes?: boolean
  fileTypes?: string[]
}

export interface ListSearchFileReply {
  list: TransferFileItem[]
  totalFiles: number
  totalSize: number
  shareMeta: string
}

export interface SummarizeSelectionRequest {
  token?: string
  shareMeta?: string
  fsIds: string[]
  platform?: string
  shareUrl?: string
  password?: string
}

export interface SummarizeSelectionReply {
  totalSize: number
  fileCount: number
  folderCount: number
  formatSummary: string
}

export interface TransferSearchToAccountRequest {
  // 不传时由服务端自动选号
  accountId?: number
  token?: string
  platform?: string
  shareUrl?: string
  password?: string
  targetDir?: string
  createShare?: boolean
  items?: TransferSearchToAccountItem[]
  excludeAccountIds?: number[]
}

export interface TransferSearchToAccountItem {
  newPath: string
  fsId: string
}

export interface TransferSearchToAccountReply {
  accountId: number
  platform: string
  fsId: string
  shareUrl: string
  size: number
  fileCount: number
  folderCount: number
  targetDir?: string
  files?: TransferSavedFile[]
}

export interface TransferSavedFile {
  name: string
  isDir: boolean
  size: number
  newPath?: string
  fsId?: string
}

export interface FilterFileInput {
  path: string
  size: number
  fsId: string
  isDir?: boolean
}

export interface FilterAdFilesRequest {
  files: FilterFileInput[]
  minSize?: number
  maxSize?: number
  fileTypes?: string[]
}

export interface FilteredFile {
  newPath: string
  size: number
  fsId: string
  isDir?: boolean
}

export interface FilterAdFilesReply {
  list: FilteredFile[]
}
