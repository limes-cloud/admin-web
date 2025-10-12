export interface GetSystemSettingRequest {
	dictionaryKeywords?: string[];
}

export interface GetSystemSettingReply {
	name: string;
	debug: boolean;
	title: string;
	desc: string;
	copyright: string;
	logo: string;
	popupType: string;
}
