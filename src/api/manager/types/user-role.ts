import { Role } from './role';

export interface UserRole {
	user_id: number;
	role_id: number;
	role?: Role;
}

export interface SwitchUserRole {
	token: string;
}
