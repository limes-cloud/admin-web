import request from '@/utils/http'
import {
  ListBannerRequest,
  ListBannerReply,
  CreateBannerRequest,
  CreateBannerReply,
  UpdateBannerRequest,
  DeleteBannerRequest
} from './type'

// ListBanner 获取轮播列表
export function ListBanner(params: ListBannerRequest) {
  return request.get<ListBannerReply>({ url: '/recipe/api/banners', params })
}

// CreateBanner 创建轮播
export function CreateBanner(data: CreateBannerRequest) {
  return request.post<CreateBannerReply>({ url: '/recipe/api/banner', data })
}

// UpdateBanner 更新轮播
export function UpdateBanner(data: UpdateBannerRequest) {
  return request.put({ url: '/recipe/api/banner', data })
}

// DeleteBanner 删除轮播
export function DeleteBanner(params: DeleteBannerRequest) {
  return request.del({ url: '/recipe/api/banner', params })
}
