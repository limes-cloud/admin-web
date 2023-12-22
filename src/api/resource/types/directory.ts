export interface Directory {
	id: number;
	parent_id: number;
	name: string;
	children: Directory[];
}

export interface GetDirectoryReq {
	app: string;
	parent_id: number;
	name?: string;
}

export interface AddDirectoryReq {
	parent_id: number;
	name: string;
	app: string;
}

export interface UpdateDirectoryReq {
	id: number;
	app: string;
	name: string;
}

export interface DeleteDirectoryReq {
	id: number;
	app: string;
}
