import axios from 'axios';
import { AddUserAppReq, DeleteUserAppReq } from './types/user-app';

export function addUserApp(data: AddUserAppReq) {
	return axios.post('/user-center/v1/user/app', data);
}

export function deleteUserApp(data: DeleteUserAppReq) {
	return axios.delete('/user-center/v1/user/app', { params: { ...data } });
}
