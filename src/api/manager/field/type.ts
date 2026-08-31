// FieldRule 校验规则
export interface FieldRule {
  type: string // phone/email/idcard/url/chinese/number/alphanum/regex
  message?: string // 自定义错误提示
  pattern?: string // type=regex 时的自定义正则
}

// FieldOption 选项（radio/checkbox/select）
export interface FieldOption {
  label: string
  value: string
}

// FieldConfig 组件配置
export interface FieldConfig {
  placeholder?: string
  defaultValue?: string
  maxLength?: number
  minLength?: number // 最小长度
  min?: number // number 组件
  max?: number // number 组件
  step?: number // number 组件
  options?: FieldOption[] // radio/checkbox/select
  filetype?: string // upload: image/video/file
  limit?: number // upload: 最大文件数
  rule?: FieldRule
}

// FieldOptionItem 选项枚举（类型/规则）
export interface FieldOptionItem {
  value: string
  name: string
}

// FieldOptions ListFieldOptions 返回
export interface FieldOptions {
  types: FieldOptionItem[]
  rules: FieldOptionItem[]
}

export interface Field {
  id: number
  keyword: string
  type: string
  name: string
  config?: FieldConfig
  status?: boolean
  description?: string
  createdAt: number
  updatedAt: number
}

export interface ListFieldRequest {
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  keyword?: string
  name?: string
  type?: string
  status?: boolean
}

export interface ListFieldReply {
  total: number
  list: Field[]
}

export interface CreateFieldRequest {
  keyword: string
  type: string
  name: string
  config?: FieldConfig
  description?: string
}

export interface CreateFieldReply {
  id: number
}

export interface UpdateFieldRequest {
  id: number
  keyword?: string
  type?: string
  name?: string
  config?: FieldConfig
  status?: boolean
  description?: string
}

export interface DeleteFieldRequest {
  id: number
}
