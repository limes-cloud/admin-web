import axios from 'axios';
import { GetSystemSettingReply, GetSystemSettingRequest } from './type';

// GetSystemSetting 获取系统设置
export function GetSystemSetting(params?: GetSystemSettingRequest) {
	return axios.get<GetSystemSettingReply>('/manager/api/v1/system/setting', { params });
}

export default null;
