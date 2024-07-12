export interface ListEnvRequest {
	keyword?: string;
	name?: string;
	status?: boolean;
}

export interface Env {
	id: number;
	keyword: string;
	name: string;
	status?: boolean;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListEnvReply {
	total: number;
	list: Env[];
}

export interface CreateEnvRequest {
	keyword: string;
	name: string;
	status?: boolean;
	description?: string;
}

export interface CreateEnvReply {
	id: number;
}

export interface UpdateEnvRequest {
	id: number;
	keyword: string;
	name: string;
	description?: string;
}

export interface DeleteEnvRequest {
	id: number;
}

export interface GetEnvTokenRequest {
	id: number;
}

export interface GetEnvTokenReply {
	token: string;
}

export interface ResetEnvTokenRequest {
	id: number;
}

export interface ResetEnvTokenReply {
	token: string;
}

export interface UpdateEnvStatusRequest {
	id: number;
	status: boolean;
}
