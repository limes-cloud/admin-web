export interface ResourceClassify {
	id: number;
	name: string;
	weight: number;
	created_at: number;
	updated_at: number;
}

export interface AddResourceClassifyReq {
	name: string;
	weight: number;
}

export interface UpdateResourceClassifyReq {
	id: number;
	name: string;
	weight: number;
}
