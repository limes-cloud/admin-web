import axios from 'axios';
import { SwitchUserRole, UserRole } from './types/user-role';

export function currentUserRoles() {
	return axios.get<UserRole[]>('/manager/v1/user/current/roles');
}

export function switchUserRole(id: number) {
	return axios.post<SwitchUserRole>('/manager/v1/user/role/switch', {
		role_id: id
	});
}

export function getUserRoles(id: number) {
	return axios.get<UserRole[]>('/manager/v1/user/roles', {
		params: { user_id: id }
	});
}

export default null;
