export interface NewsClassify {
	id: number;
	name: string;
	weight: number;
	created_at: number;
	updated_at: number;
}

export interface AddNewsClassifyReq {
	name: string;
	weight: number;
}

export interface UpdateNewsClassifyReq {
	id: number;
	name: string;
	weight: number;
}
