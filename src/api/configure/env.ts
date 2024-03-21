import axios from 'axios';
import { AllEnv, Env } from './types/env';

export function allEnv() {
	return axios.get<AllEnv>('/configure/v1/envs');
}

export function addEnv(data: Env) {
	return axios.post<{ id: number }>('/configure/v1/env', data);
}

export function updateEnv(data: Env) {
	return axios.put('/configure/v1/env', data);
}

export function deleteEnv(id: number) {
	return axios.delete('/configure/v1/env', { params: { id } });
}

export function resetEnvToken(id: number) {
	return axios.put('/configure/v1/env/token', { id });
}

export function queryEnvToken(id: number) {
	return axios.get('/configure/v1/env/token', { params: { id } });
}

export default null;
