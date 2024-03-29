// export interface UserExtra {
// 	id: number;
// 	user_id: number;
// 	keyword: string;
// 	value: any;
// 	type: string;
// 	created_at: number;
// }

export interface AddUserExtraReq {
	user_id: number;
	keyword: string;
	value: any;
}

export interface DeleteUserExtraReq {
	user_id: number;
	keyword: string;
}
