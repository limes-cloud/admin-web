import axios from 'axios';
import {
	UpdateVideoClassifyReq,
	AddVideoClassifyReq,
	PageVideoContentReq,
	AddVideoContentReq,
	PageVideoContentRes,
	VideoContent,
	UpdateVideoContentReq,
	PageVideoClassifyRes,
	PageVideoClassifyReq
} from './types/video';

export function pageVideoClassify(req: PageVideoClassifyReq) {
	return axios.get<PageVideoClassifyRes>('/party-affairs/admin/v1/video/classify', { params: req });
}

export function addVideoClassify(data: AddVideoClassifyReq) {
	return axios.post('/party-affairs/admin/v1/video/classify', data);
}

export function updateVideoClassify(data: UpdateVideoClassifyReq) {
	return axios.put('/party-affairs/admin/v1/video/classify', data);
}

export function deleteVideoClassify(id: number) {
	return axios.delete('/party-affairs/admin/v1/video/classify', {
		params: { id }
	});
}

export function pageVideoContent(data: PageVideoContentReq) {
	return axios.get<PageVideoContentRes>('/party-affairs/admin/v1/video/contents', {
		params: { ...data }
	});
}

export function getVideoContent(id: number) {
	return axios.get<VideoContent>('/party-affairs/admin/v1/video/content', {
		params: { id }
	});
}

export function addVideoContent(data: AddVideoContentReq) {
	return axios.post('/party-affairs/admin/v1/video/content', data);
}

export function updateVideoContent(data: UpdateVideoContentReq) {
	return axios.put('/party-affairs/admin/v1/video/content', data);
}

export function deleteVideoContent(id: number) {
	return axios.delete('/party-affairs/admin/v1/video/content', {
		params: { id }
	});
}

export default null;
