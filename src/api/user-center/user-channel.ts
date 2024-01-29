import axios from 'axios';
import { AddUserChannelReq, DeleteUserChannelReq } from './types/user-channel';

export function addUserChannel(data: AddUserChannelReq) {
	return axios.post('/user-center/admin/v1/user/channel', data);
}

export function deleteUserChannel(data: DeleteUserChannelReq) {
	return axios.delete('/user-center/admin/v1/user/channel', { params: { ...data } });
}
