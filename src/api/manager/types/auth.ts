export interface LoginReq {
	username: string;
	password: string;
	captcha: string;
	captcha_id: string;
}

export interface LoginRes {
	token: string;
}

export interface LoginCaptchaRes {
	uuid: string;
	captcha: string;
	expire: number;
}
