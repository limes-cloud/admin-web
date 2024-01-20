export interface SyncConfigureReq {
	server_id: number;
	env_id: number;
	description: string;
}

export interface CompareConfigureReq {
	server_id: number;
	env_id: number;
}

export interface CompareConfigureInfo {
	type: string;
	key: string;
	old: string;
	cur: string;
}

export interface CompareConfigureRes {
	list: CompareConfigureInfo[];
}
