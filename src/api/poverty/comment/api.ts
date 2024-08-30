import axios from 'axios';
import { DeleteCommentRequest, ListCommentReply, ListCommentRequest } from './type';

// ListInformation 获取资讯记录
export function ListComment(params: ListCommentRequest) {
	return axios.get<ListCommentReply>('/poverty/api/v1/comments', { params });
}

// DeleteComment 删除轮播信息
export function DeleteComment(params: DeleteCommentRequest) {
	return axios.delete('/poverty/api/v1/comment', { params });
}
export default null;
