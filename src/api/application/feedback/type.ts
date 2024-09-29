export interface ListFeedbackCategoryRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	name?: string;
}

export interface FeedbackCategory {
	id: number;
	name: string;
}

export interface ListFeedbackCategoryReply {
	total: number;
	list: FeedbackCategory[];
}

export interface CreateFeedbackCategoryRequest {
	name: string;
}

export interface CreateFeedbackCategoryReply {
	id: number;
}

export interface UpdateFeedbackCategoryRequest {
	id: number;
	name: string;
}

export interface DeleteFeedbackCategoryRequest {
	id: number;
}

export interface ListFeedbackRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	appId?: number;
	categoryId?: number;
	status?: string;
	platform?: string;
}

export interface App {
	id: number;
	name: string;
}

export interface User {
	id: number;
	realName: string;
	nickName: string;
}

export interface Feedback {
	id: number;
	appId: number;
	userId: number;
	categoryId: number;
	title: string;
	content: string;
	status: string;
	images?: string;
	imageUrls: string[];
	contact?: string;
	device: string;
	deviceInfo: any;
	platform: string;
	version: string;
	processedBy?: number;
	processedResult?: string;
	createdAt: number;
	updatedAt: number;
	app?: App;
	user?: User;
	category?: FeedbackCategory;
}

export interface Channel {
	id: number;
	name: string;
}

export interface ListFeedbackReply {
	total: number;
	list: Feedback[];
}

export interface CreateFeedbackRequest {
	appId: number;
	userId: number;
	categoryId: number;
	title: string;
	content: string;
	images?: string;
	contact?: string;
	device: string;
	platform: string;
	version: string;
}

export interface CreateFeedbackReply {
	id: number;
}

export interface DeleteFeedbackRequest {
	id: number;
}

export interface UpdateFeedbackRequest {
	id: number;
	status: string;
	processedBy?: number;
	processedResult?: string;
}
