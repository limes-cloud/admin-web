export interface ListBannerRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	title?: string;
	status?: boolean;
}

export interface Banner {
	id: number;
	title: string;
	src: string;
	path?: string;
	weight?: number;
	status?: boolean;
	createdAt: number;
	updatedAt: number;
}

export interface ListBannerReply {
	total: number;
	list: Banner[];
}

export interface CreateBannerRequest {
	title: string;
	src: string;
	path?: string;
	weight?: number;
	status: boolean;
}

export interface CreateBannerReply {
	id: number;
}

export interface UpdateBannerRequest {
	id: number;
	title?: string;
	src?: string;
	path?: string;
	weight?: number;
	status?: boolean;
}

export interface DeleteBannerRequest {
	id: number;
}
