export interface SyncConfigureRequest {
	serverId: number;
	envId: number;
	description: string;
}

export interface CompareConfigureRequest {
	serverId: number;
	envId: number;
}

export interface CompareConfigureInfo {
	type: string;
	key: string;
	old: string;
	cur: string;
}

export interface CompareConfigureReply {
	list: CompareConfigureInfo[];
}
