export interface OAuthHandlerRequest {
	user?: string;
	keyword: string;
}

export interface OAuthHandlerReply {
	uuid: string;
	action: string;
	value: string;
	tip: string;
	keyword: string;
	codeField: string;
}

export interface OAuthLoginRequest {
	user?: string;
	uuid: string;
	keyword: string;
	code: string;
}

export interface OAuthLoginReply {
	isBind: boolean;
	token?: string;
}

export interface OAuthBindRequest {
	tenant: string;
	username: string;
	password: string;
	captchaId: string;
	captcha: string;
	keyword: string;
	uuid: string;
}

export interface OAuthBindReply {
	token: string;
}

export interface ReportOAuthCodeRequest {
	uuid: string;
	keyword: string;
	code: string;
}

export interface ListLoginLogRequest {
	page: number;
	pageSize: number;
	username?: string;
	createdAts?: number[];
}

export interface LoginLog {
	username: string;
	type: string;
	ip: string;
	address: string;
	browser: string;
	device: string;
	code: number;
	description: string;
}

export interface ListLoginLogReply {
	total: number;
	list: LoginLog[];
}

export interface ListAuthLogRequest {
	page: number;
	pageSize: number;
	username?: number;
	createdAts?: number[];
}

export interface AuthLog {
	username: string;
	api: string;
	method: string;
	name: string;
	createdAt: number;
}

export interface ListAuthLogReply {
	total: number;
	list: AuthLog[];
}
