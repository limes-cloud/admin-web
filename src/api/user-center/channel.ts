import axios from 'axios';
import { AllChannelRes, AllTypeRes, Channel } from './types/channel';

export function allType() {
	return axios.get<AllTypeRes>('/user-center/v1/channel/types');
}

export function allChannel() {
	return axios.get<AllChannelRes>('/user-center/v1/channels');
}

export function addChannel(data: Channel) {
	return axios.post('/user-center/v1/channel', data);
}

export function updateChannel(data: Channel) {
	return axios.put('/user-center/v1/channel', data);
}

export function deleteChannel(id: number) {
	return axios.delete('/user-center/v1/channel', { params: { id } });
}

export default null;
