export interface Agreement {
	id: number;
	name: string;
	content: string;
	status: boolean;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface PageAgreementReq {
	page: number;
	page_size: number;
	name?: string;
}

export interface PageAgreementRes {
	total: number;
	list: Agreement[];
}
