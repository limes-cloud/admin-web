import axios from 'axios';
import { SimpleUser } from '@/types/global';
import { UpdateNoticeReq, AddNoticeReq, PageNoticeReq, PageNoticeRes, Notice, PageNoticeUserReq, PageNoticeUserRes } from './types/notice';

export function pageNotice(req: PageNoticeReq) {
	return axios.get<PageNoticeRes>('/party-affairs/v1/notices', { params: req });
}

export function getNotice(id: number) {
	return axios.get<Notice>('/party-affairs/v1/notice', { params: { id } });
}

export function addNotice(data: AddNoticeReq) {
	return axios.post('/party-affairs/v1/notice', data);
}

export function updateNotice(data: UpdateNoticeReq) {
	return axios.put('/party-affairs/v1/notice', data);
}

export function deleteNotice(id: number) {
	return axios.delete('/party-affairs/v1/notice', {
		params: { id }
	});
}

export function pageNoticeUser(req: PageNoticeUserReq) {
	return axios.get<PageNoticeUserRes>('/party-affairs/v1/notice/users', { params: req });
}

export default null;
