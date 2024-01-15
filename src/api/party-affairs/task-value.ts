import axios from 'axios';
import { PageTaskValueReq, PageTaskValueRes } from './types/task-value';

export function pageTaskValue(data: PageTaskValueReq) {
	return axios.get<PageTaskValueRes>('/party-affairs/admin/v1/task/values', {
		params: { ...data }
	});
}

export function deleteTaskValue(id: number) {
	return axios.delete('/party-affairs/admin/v1/task/value', {
		params: { id }
	});
}

export default null;
