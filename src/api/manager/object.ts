import axios from 'axios';
import { extractValues } from '@/utils';
import { PageObjectReq, PageObjectRes, ObjectDef, ObjectValue } from './types/object';

export function getObject(id: number) {
	return axios.get<ObjectDef>('/manager/v1/object', { params: { id } });
}

export function pageObject(req: PageObjectReq) {
	return axios.get<PageObjectRes>('/manager/v1/objects', { params: { ...req } });
}

export function addObject(data: ObjectDef) {
	return axios.post('/manager/v1/object', data);
}

export function updateObject(data: ObjectDef) {
	return axios.put('/manager/v1/object', data);
}

export function deleteObject(id: number) {
	return axios.delete('/manager/v1/object', { params: { id } });
}

export function loadObjectValue(req: ObjectDef) {
	return new Promise((resolve, reject) => {
		const getValue = async () => {
			let val: any = {};
			let params: any = {};

			if (req.params) {
				params = JSON.parse(req.params);
			}

			if (req.method === 'GET') {
				const { data } = await axios.get(req.api, { params });
				val = data;
			} else {
				const { data } = await axios.post(req.api, params);
				val = data;
			}
			return val;
		};

		getValue()
			.then((data) => {
				const labels = extractValues(data, req.label);
				// 提取value
				const values = extractValues(data, req.value);

				const dvs: ObjectValue[] = [];
				const len = labels.length;
				for (let i = 0; i < len; i += 1) {
					dvs.push({
						label: labels[i],
						value: values[i]
					});
				}

				resolve(dvs);
			})
			.catch((e) => {
				reject(e);
			});
	});
}

export default null;
