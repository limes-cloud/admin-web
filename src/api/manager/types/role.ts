export interface Role {
	id: number;
	parent_id: number;
	name: string;
	keyword: string;
	status: boolean;
	description: string;
	department_ids: string | number[];
	data_scope: string;
	created_at: number;
	updated_at: number;
}

export interface UpdateRoleMenuReq {
	role_id: number;
	menu_ids: number[];
}
