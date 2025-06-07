import axios from 'axios';
import { getToken } from '@/utils/auth';
import {
	ListSysChatReply,
	ListSysChatRequest,
	CreateSysChatReply,
	CreateSysChatRequest,
	UpdateSysChatRequest,
	DeleteSysChatRequest,
	ConversationSysChatRequest,
	ConversationSysChatReply,
	ConversationSysChatReplyFunc
} from './type';

export const ConversationSysChat = async (data: ConversationSysChatRequest, reply: ConversationSysChatReplyFunc) => {
	const response = await fetch(`${axios.defaults.baseURL}/ai-agent/api/v1/sys-chat/conversation`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${getToken()}`
		},
		body: JSON.stringify({
			...data
		})
	});
	if (!response.body) {
		throw new Error('ReadableStream not supported in this browser.');
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();

	// 读取数据

	function readStream() {
		reader
			.read()
			.then(({ done, value }) => {
				if (done) {
					// 流已结束
					reply.done();
					return;
				}
				// 解码并处理服务器发来的数据
				const text = decoder.decode(value, { stream: true });
				const arr = text.split('\n');
				for (let i = 0; i < arr.length; i += 1) {
					const str = arr[i];
					if (str.trim() === '') {
						continue;
					}
					const parsed = JSON.parse(str);
					reply.handler({ content: parsed.content } as ConversationSysChatReply);
					// if (data.reason && func.error) {
					// 	func.error(data.message);
					// 	break;
					// } else if (func.back) {
					// 	func.back(data);
					// }
				}

				// 递归调用以继续读取下一部分数据
				readStream();
			})
			.catch((error) => {
				reply.error(`Stream reading error:${error}`);
			});
	}
	readStream();

	// if (response.body) {
	// 	const reader = response.body.getReader();
	// 	const isEnd = false;
	// 	while (!isEnd) {
	// 		const { value, done } = await reader.read();
	// 		const msg = new TextDecoder().decode(value);
	// 		if (msg !== '') {
	// 			const arr = msg.split('\n');
	// 			for (let i = 0; i < arr.length; i += 1) {
	// 				const str = arr[i];
	// 				if (str.trim() === '') {
	// 					continue;
	// 				}
	// 				const data = JSON.parse(str);
	// 				if (data.reason && func.error) {
	// 					func.error(data.message);
	// 					break;
	// 				} else if (func.back) {
	// 					func.back(data);
	// 				}
	// 			}
	// 		}

	// 		if (done) {
	// 			if (func.done) {
	// 				func.done();
	// 			}
	// 			break;
	// 		}
	// 	}
	// }
};

// ListSysChat 获取会话列表
export function ListSysChat(params: ListSysChatRequest) {
	return axios.get<ListSysChatReply>('/ai-agent/api/v1/sys-chats', { params });
}

// CreateSysChat 创建会话
export function CreateSysChat(data: CreateSysChatRequest) {
	return axios.post<CreateSysChatReply>('/ai-agent/api/v1/sys-chat', data);
}

// UpdateSysChat 更新会话
export function UpdateSysChat(data: UpdateSysChatRequest) {
	return axios.put('/ai-agent/api/v1/sys-chat', data);
}

// DeleteSysChat 删除会话
export function DeleteSysChat(params: DeleteSysChatRequest) {
	return axios.delete('/ai-agent/api/v1/sys-chat', { params });
}
