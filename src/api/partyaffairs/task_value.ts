import axios from 'axios';
import { PageTaskValueReq, PageTaskValueRes } from './types/task_value';

export function pageTaskValue(data: PageTaskValueReq) {
	return axios.get<PageTaskValueRes>('/party_affairs/admin/v1/task/values', {
		params: { ...data }
	});
}

export function deleteTaskValue(id: number) {
	return axios.delete('/party_affairs/admin/v1/task/value', {
		params: { id }
	});
}

export default null;
