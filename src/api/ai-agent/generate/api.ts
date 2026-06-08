import request from '@/utils/http'
import {
  GenerateTextRequest,
  GenerateTextReply,
  GenerateImageRequest,
  GenerateImageReply,
  GeneratePromptTextRequest,
  GeneratePromptTextReply,
  GeneratePromptImageRequest
} from './type'

// GenerateText 文本生成
export function GenerateText(data: GenerateTextRequest) {
  return request.post<GenerateTextReply>({ url: '/ai-agent/api/generate/text', data, timeout: 60000 })
}

// GenerateImage 获取模型信息列表
export function GenerateImage(data: GenerateImageRequest) {
  return request.post<GenerateImageReply>({ url: '/ai-agent/api/generate/image', data, timeout: 60000 })
}

// GeneratePromptText 创建模型信息
export function GeneratePromptText(data: GeneratePromptTextRequest) {
  return request.post<GeneratePromptTextReply>({ url: '/ai-agent/api/generate/prompt/text', data, timeout: 60000 })
}

// GeneratePromptImage 更新模型信息
export function GeneratePromptImage(data: GeneratePromptImageRequest) {
  return request.post<GenerateImageReply>({ url: '/ai-agent/api/generate/prompt/image', data, timeout: 60000 })
}
