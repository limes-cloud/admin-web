import axios from 'axios';
import { PageUserReq, PageUserRes, User } from './types/user';

export function getUser(id: number) {
	return axios.get<User>('/user-center/admin/v1/user', { params: { id } });
}

export function pageUser(req: PageUserReq) {
	return axios.get<PageUserRes>('/user-center/admin/v1/users', { params: { ...req } });
}

export function importUser(data: User) {
	return axios.post('/user-center/admin/v1/users', { list: data });
}

export function addUser(data: User) {
	return axios.post('/user-center/admin/v1/user', data);
}

export function updateUser(data: User) {
	return axios.put('/user-center/admin/v1/user', data);
}

export function deleteUser(id: number) {
	return axios.delete('/user-center/admin/v1/user', { params: { id } });
}

export function disableUser(id: number, desc: string) {
	return axios.post('/user-center/admin/v1/user/disable', { id, desc });
}

export function enableUser(id: number) {
	return axios.post('/user-center/admin/v1/user/enable', { id });
}

export function offlineUser(id: number) {
	return axios.post('/user-center/admin/v1/user/offline', { id });
}
