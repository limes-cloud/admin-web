export interface OAuthWayRequest {
	user?: string;
	keyword: string;
}

export interface OAuthWayReply {
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
	username: string;
	password: string;
	captchaId: string;
	captcha: string;
}

export interface OAuthBindReply {
	token: string;
}

export interface ReportOAuthCodeRequest {
	uuid: string;
	keyword: string;
	code: string;
}
