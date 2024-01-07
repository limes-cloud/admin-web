export interface SyncConfigureReq {
	server_id: number;
	env_keyword: string;
	description: string;
}

export interface CompareConfigureReq {
	server_id: number;
	env_keyword: string;
}
