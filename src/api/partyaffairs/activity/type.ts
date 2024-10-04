export interface GetActivityRequest {
	id: number;
}

export interface GetActivityReply {
	id: number;
	title: string;
	cover: string;
	read: number;
	description: string;
	unit: string;
	content: string;
	isTop?: boolean;
	status?: boolean;
	createdAt: number;
	updatedAt: number;
}

export interface ListActivityRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	title?: string;
	status?: boolean;
	isTop?: boolean;
}

export interface Activity {
	id: number;
	title: string;
	cover: string;
	read: number;
	description: string;
	unit: string;
	isTop?: boolean;
	status?: boolean;
	createdAt: number;
	updatedAt: number;
}

export interface ListActivityReply {
	total: number;
	list: Activity[];
}

export interface CreateActivityRequest {
	title: string;
	cover: string;
	description: string;
	unit: string;
	content: string;
	isTop?: boolean;
	status?: boolean;
}

export interface CreateActivityReply {
	id: number;
}

export interface UpdateActivityRequest {
	id: number;
	title?: string;
	cover?: string;
	description?: string;
	unit?: string;
	content?: string;
	isTop?: boolean;
	status?: boolean;
}

export interface DeleteActivityRequest {
	id: number;
}
