export interface UserApp {
	user_id: number;
	app: string;
	status: boolean;
	last_login: string;
	token: string;
	expired_at: number;
}
