export interface GenerateTextRequest {
  model: string
  system?: string
  prompt: string
  variables?: { [key: string]: any }
  stream?: boolean
  temperature?: number
  topP?: number
  attachment?: {
    images: string[]
  }
  responseFormat?: { [key: string]: any }
}

export interface GenerateTextReply {
  content: string
  format?: { [key: string]: any }
}

export interface GenerateImageRequest {
  model: string
  prompt: string
  variables?: { [key: string]: any }
  size?: string
  directoryPath: string
  store?: string
}

export interface GenerateImageReply {
  list: string[]
}

export interface GeneratePromptTextRequest {
  prompt: string
  variables?: { [key: string]: any }
  attachment?: {
    images: string[]
  }
}

export interface GeneratePromptTextReply {
  content: string
  format?: { [key: string]: any }
}

export interface GeneratePromptImageRequest {
  prompt: string
  variables?: { [key: string]: any }
}

export interface PromptImageReply {
  list: string[]
}
