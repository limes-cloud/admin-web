export interface Content {
	id: number;
	name: string;
	content: string;
	status: boolean;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface PageContentReq {
	page: number;
	page_size: number;
	name?: string;
}

export interface PageContentRes {
	total: number;
	list: Content[];
}

export interface Scene {
	id: number;
	keyword: string;
	name: string;
	description: string;
	contents: Content[];
	content_ids: number[];
	created_at: number;
	updated_at: number;
}

export interface PageSceneReq {
	page: number;
	page_size: number;
	name?: string;
	keyword?: string;
}

export interface PageSceneRes {
	total: number;
	list: Scene[];
}
