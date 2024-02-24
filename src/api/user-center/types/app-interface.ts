export interface AppInterface {
	id: number;
	app_id: number;
	parent_id: number;
	type: string;
	title: string;
	path: string;
	method: string;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface GetAppInterfaceTreeRes {
	list: AppInterface[];
}
