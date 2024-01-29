import axios from 'axios';
import { AllChannelRes, AllPlatformRes, Channel } from './types/channel';

export function allPlatform() {
	return axios.get<AllPlatformRes>('/user-center/admin/v1/login/platforms');
}

export function allChannel() {
	return axios.get<AllChannelRes>('/user-center/admin/v1/channels');
}

export function addChannel(data: Channel) {
	return axios.post('/user-center/admin/v1/channel', data);
}

export function updateChannel(data: Channel) {
	return axios.put('/user-center/admin/v1/channel', data);
}

export function deleteChannel(id: number) {
	return axios.delete('/user-center/admin/v1/channel', { params: { id } });
}

export default null;
