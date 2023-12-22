import axios from 'axios';
import { ChangePasswordCaptchRes, ChangePasswordReq, PageUserReq, PageUserRes, UpdateUserbasicReq, User } from './types/user';

export function pageUser(req: PageUserReq) {
	return axios.get<PageUserRes>('/manager/v1/users', { params: { ...req } });
}

export function currentUser() {
	return axios.get<User>('/manager/v1/user/current');
}

export function addUser(data: User) {
	return axios.post('/manager/v1/user', data);
}

export function updateUser(data: User) {
	return axios.put('/manager/v1/user', data);
}

export function updateUserBasic(data: UpdateUserbasicReq) {
	return axios.put('/manager/v1/user/basic', data);
}

export function deleteUser(id: number) {
	return axios.delete('/manager/v1/user', { params: { id } });
}

export function disableUser(id: number, desc: string) {
	return axios.post('/manager/v1/user/disable', { id, desc });
}

export function enableUser(id: number) {
	return axios.post('/manager/v1/user/enable', { id });
}

export function offlineUser(id: number) {
	return axios.post('/manager/v1/user/offline', { id });
}

export function resetPassword(id: number) {
	return axios.post('/manager/v1/user/password/reset', { id });
}

export function changePassword(req: ChangePasswordReq) {
	return axios.post('/manager/v1/user/password/change', req);
}

export function sendChangePasswordEmail() {
	return axios.post<ChangePasswordCaptchRes>('/manager/v1/user/password/captcha');
}

export default null;
