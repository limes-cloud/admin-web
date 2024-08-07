import axios from 'axios';
import { ListBannerReply, ListBannerRequest, CreateBannerReply, CreateBannerRequest, UpdateBannerRequest, DeleteBannerRequest } from './type';

// ListBanner 获取轮播信息列表
export function ListBanner(params: ListBannerRequest) {
	return axios.get<ListBannerReply>('/poverty/api/v1/banners', { params });
}

// CreateBanner 创建轮播信息
export function CreateBanner(data: CreateBannerRequest) {
	return axios.post<CreateBannerReply>('/poverty/api/v1/banner', data);
}

// UpdateBanner 更新轮播信息
export function UpdateBanner(data: UpdateBannerRequest) {
	return axios.put('/poverty/api/v1/banner', data);
}

// DeleteBanner 删除轮播信息
export function DeleteBanner(params: DeleteBannerRequest) {
	return axios.delete('/poverty/api/v1/banner', { params });
}
