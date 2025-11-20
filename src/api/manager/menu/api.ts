import request from '@/utils/http'
import {
  ListMenuRequest,
  ListMenuReply,
  CreateMenuRequest,
  CreateMenuReply,
  UpdateMenuRequest,
  DeleteMenuRequest
} from './type'

// ListCurrentMenu 获取当前的菜单列表
export function ListCurrentMenu(params?: ListMenuRequest) {
  return request.get<ListMenuReply>({ url: '/manager/api/current/menus', params })
}

// ListMenu 获取菜单信息列表
export function ListMenu(params: ListMenuRequest) {
  return request.get<ListMenuReply>({ url: '/manager/api/menus', params })
}

// CreateMenu 创建菜单信息
export function CreateMenu(data: CreateMenuRequest) {
  return request.post<CreateMenuReply>({ url: '/manager/api/menu', data })
}

// UpdateMenu 更新菜单信息
export function UpdateMenu(data: UpdateMenuRequest) {
  return request.put({ url: '/manager/api/menu', data })
}

// DeleteMenu 删除菜单信息
export function DeleteMenu(params: DeleteMenuRequest) {
  return request.del({ url: '/manager/api/menu', params })
}
