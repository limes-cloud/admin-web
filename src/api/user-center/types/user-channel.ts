// export interface UserExtra {
// 	id: number;
// 	user_id: number;
// 	keyword: string;
// 	value: any;
// 	type: string;
// 	created_at: number;
// }

export interface AddUserChannelReq {
	user_id: number;
	app_id: number;
}

export interface DeleteUserChannelReq {
	user_id: number;
	app_id: number;
}
