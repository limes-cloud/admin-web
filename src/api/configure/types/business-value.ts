export interface BusinessValue {
	id?: number;
	env_id: number;
	business_id?: number;
	env_keyword?: string;
	value: string;
}

export interface AllBusinessValue {
	list: BusinessValue[];
}

export default null;
