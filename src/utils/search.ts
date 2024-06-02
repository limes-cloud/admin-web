import { Result } from '@arco-design/web-vue';

type Value = number | string;
export type Params = { page: number; pageSize: number; query?: string | boolean | number };
export type Result = { value: Value; label: string };
export type QueryHandleFunc = (req: Params) => Promise<Result[]>;
export type IsSelectHandleFunc = (req: Value) => boolean;

export class Search {
	store: Record<Value, boolean> = {};

	result: Result[] = [];

	params: Params = { page: 1, pageSize: 10 };

	isSelectdHandler?: IsSelectHandleFunc;

	queryHandler?: QueryHandleFunc;

	constructor(result: Result[], qh: QueryHandleFunc, ish: IsSelectHandleFunc) {
		this.result = result;
		this.queryHandler = qh;
		this.isSelectdHandler = ish;
	}

	private search = async () => {
		if (!this.queryHandler) return [];
		const result = await this.queryHandler(this.params);
		return result;
	};

	Search = async (query?: string | number | boolean) => {
		this.store = {};
		for (let i = 0; i < this.result.length; i += 1) {
			const item = this.result[i];
			this.store[item.value] = true;
			if (this.isSelectdHandler == null || !this.isSelectdHandler(item.value)) {
				this.result.splice(i, 1);
				i -= 1;
				this.store[item.value] = false;
			}
		}
		this.params.page = 1;
		this.params.pageSize = 10;
		this.params.query = query;
		const sd = await this.search();
		sd.forEach((item) => {
			if (!this.store[item.value]) {
				this.result.push(item);
			}
		});
	};

	NextSearch = async () => {
		if (!this.queryHandler) return;
		if (this.result.length < this.params.page * this.params.pageSize) return;
		this.params.page += 1;
		const sd = await this.search();
		sd.forEach((item) => {
			if (!this.store[item.value]) {
				this.result.push(item);
			}
		});
	};

	IsExist = async (value: Value) => {
		return this.store[value];
	};
}
