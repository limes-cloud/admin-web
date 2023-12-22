import axios from 'axios';
import { Setting } from '@/api/manager/types/setting';

export function setting() {
	return axios.get<Setting>('/manager/v1/setting');
}

export default null;
