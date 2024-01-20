export interface Env {
	id: number;
	keyword: string;
	name: string;
	status: boolean;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface AllEnv {
	list: Env[];
}
