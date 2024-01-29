// export interface UserApp {
// 	user_id: number;
// 	app: string;
// 	status: boolean;
// 	last_login: string;
// 	token: string;
// 	expired_at: number;
// }

export interface AddUserAppReq {
	user_id: number;
	app_id: number;
}

export interface DeleteUserAppReq {
	user_id: number;
	app_id: number;
}
