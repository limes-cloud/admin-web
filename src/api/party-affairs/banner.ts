import axios from 'axios';
import { UpdateBannerReq, AddBannerReq, AllBannerRes } from './types/banner';

export function allBanner() {
	return axios.get<AllBannerRes>('/party-affairs/admin/v1/banners');
}

export function addBanner(data: AddBannerReq) {
	return axios.post('/party-affairs/admin/v1/banner', data);
}

export function updateBanner(data: UpdateBannerReq) {
	return axios.put('/party-affairs/admin/v1/banner', data);
}

export function deleteBanner(id: number) {
	return axios.delete('/party-affairs/admin/v1/banner', {
		params: { id }
	});
}

export default null;
