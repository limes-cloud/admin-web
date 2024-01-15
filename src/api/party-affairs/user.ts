import axios from 'axios';
import { PageUserReq, PageUserRes, User } from './types/user';

export function pageUser(req: PageUserReq) {
	return axios.get<PageUserRes>('/party-affairs/admin/v1/users', {
		params: { ...req }
	});
}

export function currentUser() {
	return axios.get<User>('/party-affairs/admin/v1/user/current');
}

export function addUser(data: User) {
	return axios.post('/party-affairs/admin/v1/user', data);
}

export function updateUser(data: User) {
	return axios.put('/party-affairs/admin/v1/user', data);
}

export function deleteUser(id: number) {
	return axios.delete('/party-affairs/admin/v1/user', { params: { id } });
}

export function changeUserStatus(id: number, status: boolean) {
	return axios.post('/party-affairs/admin/v1/user/status', { id, status });
}

export function offlineUser(id: number) {
	return axios.post('/party-affairs/admin/v1/user/offline', { id });
}

export default null;
