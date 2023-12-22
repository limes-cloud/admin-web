export interface Department {
	id?: number;
	parent_id: number;
	keyword: string;
	name: string;
	description: string;
	children?: Department[];
	created_at: number;
	updated_at: number;
}
