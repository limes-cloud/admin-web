export interface ListMenuRequest {
  appId: number
  title?: string
  onlyMenu?: boolean
}

export interface Menu {
  id: number
  appId: number
  parentId: number
  title: string
  type: string
  keyword?: string
  icon?: string
  api?: string
  method?: string
  path?: string
  permission?: string
  component?: string
  url?: string
  redirect?: string
  weight?: number
  isIframe?: boolean
  isHidden?: boolean
  isCache?: boolean
  isHome?: boolean
  isAffix?: boolean
  createdAt: number
  updatedAt: number
  children: Menu[]
}

export interface ListMenuReply {
  total: number
  list: Menu[]
}

export interface ListCurrentMenuReply {
  total: number
  list: Menu[]
}

export interface CreateMenuRequest {
  parentId: number
  title: string
  type: string
  keyword?: string
  icon?: string
  api?: string
  method?: string
  path?: string
  permission?: string
  component?: string
  redirect?: string
  weight?: number
  isHidden?: boolean
  isCache?: boolean
  isHome?: boolean
  isAffix?: boolean
}

export interface CreateMenuReply {
  id: number
}

export interface UpdateMenuRequest {
  id: number
  parentId: number
  title: string
  type: string
  keyword?: string
  icon?: string
  api?: string
  method?: string
  path?: string
  permission?: string
  component?: string
  redirect?: string
  weight?: number
  isHidden?: boolean
  isCache?: boolean
  isHome?: boolean
  isAffix?: boolean
}

export interface DeleteMenuRequest {
  id: number
}

export interface DeleteMenuReply {
  total: number
}
