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
  return request.post<GenerateImageReply>({ url: '/ai-agent/api/generate/image', data, timeout: 120000 })
}

// GeneratePromptText 按提示词生成文本；跨应用调用时可指定 appKey
export function GeneratePromptText(data: GeneratePromptTextRequest, appKey?: string) {
  return request.post<GeneratePromptTextReply>({
    url: '/ai-agent/api/generate/prompt/text',
    data,
    timeout: 60000,
    ...(appKey ? { headers: { 'X-App-Key': appKey } } : {})
  })
}

// GeneratePromptImage 更新模型信息
export function GeneratePromptImage(data: GeneratePromptImageRequest) {
  return request.post<GenerateImageReply>({ url: '/ai-agent/api/generate/prompt/image', data, timeout: 120000 })
}
