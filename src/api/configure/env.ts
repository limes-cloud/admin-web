import axios from 'axios';
import { Env } from './types/env';

export function allEnv() {
	return axios.get<Env[]>('/configure/v1/environments');
}

export function addEnv(data: Env) {
	return axios.post('/configure/v1/environment', data);
}

export function updateEnv(data: Env) {
	return axios.put('/configure/v1/environment', data);
}

export function deleteEnv(id: number) {
	return axios.delete('/configure/v1/environment', { params: { id } });
}

export function resetEnvToken(id: number) {
	return axios.put('/configure/v1/environment/token', { id });
}

export function queryEnvToken(id: number) {
	return axios.get('/configure/v1/environment/token', { params: { id } });
}

export default null;
