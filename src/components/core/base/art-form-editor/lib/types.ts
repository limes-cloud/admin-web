// ============================================================
// ArtFormEditor 类型定义
// ============================================================

// --- 校验规则 ---
export interface ComponentRule {
  label: string // 规则显示名
  value: string // 规则标识：phone/email/idcard/url/chinese/number/alphanum/regex
  message?: string // 自定义错误提示
  pattern?: string // regex 时的正则表达式
}

// --- 选项 ---
export interface OptionItem {
  label: string
  value: string
}

// --- 远程数据配置 ---
export interface RemoteConfig {
  url: string // API 地址
  method?: 'GET' | 'POST' // 默认 GET
  labelField?: string // 默认 'label'
  valueField?: string // 默认 'value'
  dataPath?: string // 响应中数据路径，如 'data.list'
  headers?: Record<string, string> // 请求头
  dependsOn?: string[] // 依赖字段，值变化时重新请求
  params?: string // URL 参数模板，支持 {{field}} 占位
  debounce?: number // 防抖 ms，默认 300
}

// --- 联动条件 ---
export interface NodeRelation {
  field: string // 触发字段标识
  condition:
    | 'eq' | 'neq' | 'in' | 'notIn' | 'empty' | 'notEmpty'
    | 'gt' | 'lt' | 'gte' | 'lte'
    | 'contains' | 'between' | 'pattern'
  value?: any // 条件值（empty/notEmpty 忽略；between 为 [min, max]）
  effect: 'show' | 'hide' | 'disabled' | 'required' | 'value'
  effectValue?: any // effect='value' 时的赋值目标
}

// --- 计算属性配置 ---
export interface ComputedConfig {
  enabled: boolean // 是否启用
  expression: string // 表达式模板，如 "{{price}} * {{quantity}}"
  dependencies?: string[] // 依赖字段（自动从 expression 提取）
}

// --- 节点设计时配置 ---
export interface NodeConfig {
  // 通用
  required?: boolean
  hidden?: boolean // 初始隐藏
  description?: string // 帮助文本
  placeholder?: string // 提示文本
  value?: any // 默认值

  // 校验
  rule?: ComponentRule

  // 长度限制（input/textarea/password）
  maxLength?: number
  minLength?: number

  // 数字（number 组件）
  min?: number
  max?: number
  step?: number

  // 上传（upload 组件）
  filetype?: string // image/video/file
  limit?: number // 最大文件数

  // 选项类（radio/checkbox/select）
  options?: OptionItem[]
  optionSource?: 'static' | 'remote'
  remoteConfig?: RemoteConfig

  // 计算属性
  computed?: ComputedConfig

  // 布局（容器类型）
  span?: number // 栅格宽度 1-24
  gutter?: number // 子元素间距
  direction?: 'horizontal' | 'vertical' // flex 方向
  justify?: string // flex justify
  align?: string // flex align

  // 子表单（group 组件）
  groupMin?: number // 最少条目数，默认 0
  groupMax?: number // 最大条目数，默认 10
  groupLayout?: 'list' | 'card' // 展示样式
  groupItemTitle?: string // 条目标题前缀，如"家庭成员"，运行时显示"家庭成员 1"

  // 前缀后缀（input/password）
  prefix?: string // 前缀文本（如 ¥、https://）
  suffix?: string // 后缀文本（如 元、@gmail.com）

  // 自定义样式
  customClass?: string // 自定义 CSS 类名
  customStyle?: string // 自定义内联样式

  // 日期/时间选择器 (datepicker)
  dateType?: 'date' | 'datetime' | 'time' | 'week' | 'month' | 'year'

  // 范围选择器 (daterange)
  rangeType?: 'daterange' | 'datetimerange' | 'timerange' | 'monthrange'
  rangeSeparator?: string // 分隔符，默认 '至'
  startPlaceholder?: string // 起始占位
  endPlaceholder?: string // 结束占位

  // 颜色选择器 (colorpicker)
  showAlpha?: boolean // 是否支持透明度
  colorFormat?: 'hex' | 'rgb' | 'hsl' // 颜色格式
  predefine?: string[] // 预定义颜色

  // 树选择 (treeselect)
  treeMultiple?: boolean // 是否多选
  treeCheckStrictly?: boolean // 父子不关联
  treeShowCheckbox?: boolean // 显示 checkbox
  treeFilterable?: boolean // 可搜索
  treeData?: any[] // 静态树数据

  // 按钮 (button)
  buttonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  buttonSize?: 'large' | 'default' | 'small'
  buttonText?: string
  buttonPlain?: boolean
  buttonRound?: boolean
  buttonIcon?: string

  // 自定义HTML (html)
  htmlContent?: string

  // 段落 (paragraph)
  paragraphContent?: string
  paragraphAlign?: 'left' | 'center' | 'right'

  // 标签 (tag)
  tagText?: string
  tagType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | ''
  tagEffect?: 'dark' | 'light' | 'plain'
  tagSize?: 'large' | 'default' | 'small'
  tagRound?: boolean
  tagClosable?: boolean

  // 链接 (link)
  linkText?: string
  linkHref?: string
  linkType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  linkUnderline?: boolean
  linkTarget?: '_blank' | '_self'

  // 提示 (tooltip)
  tooltipContent?: string
  tooltipPlacement?: string
  tooltipTriggerText?: string

  // 水印 (watermark)
  watermarkContent?: string
  watermarkFontSize?: number
  watermarkRotate?: number
  watermarkGap?: [number, number]
}

// --- 表单节点 ---
export interface FormNode {
  id: string
  type: string
  field?: string // 字段标识（容器无 field）
  label?: string // 字段标签
  props?: Record<string, any> // 组件属性
  config: NodeConfig
  children?: FormNode[] // 子节点（容器类型）
  relations?: NodeRelation[] // 联动条件（多条件）
  relationLogic?: 'and' | 'or' // 组合逻辑，默认 'and'
}

// --- 表单级配置 ---
export interface FormConfig {
  labelPosition: 'left' | 'right' | 'top'
  labelWidth: string | number
  size: 'large' | 'default' | 'small'
  gutter: number
  disabled: boolean
}

// --- 表单 Schema ---
export interface FormSchema {
  config: FormConfig
  nodes: FormNode[]
}

// --- 组件描述（左侧面板用） ---
export type NodeCreator = () => FormNode

export interface ComponentGroup {
  title: string
  items: ComponentGroupItem[]
}

export interface ComponentGroupItem {
  type: string
  name: string
  icon?: string
  creater: NodeCreator
}

// --- 类型分类 ---
export const FIELD_TYPES = [
  'input', 'textarea', 'password', 'number',
  'radio', 'checkbox', 'select',
  'switch', 'slider', 'rate', 'cascader',
  'time', 'date', 'datetime',
  'datepicker', 'daterange',
  'upload',
  'colorpicker', 'treeselect'
] as const

export const CONTAINER_TYPES = [
  'row', 'col', 'card', 'tabs', 'tab-pane',
  'collapse', 'collapse-item', 'inline',
  'table', 'table-col', 'box', 'space', 'descriptions',
  'group', 'watermark'
] as const

export const AIDE_TYPES = [
  'divider', 'alert', 'text',
  'button', 'html', 'paragraph', 'tag', 'link', 'tooltip'
] as const

export type FieldType = (typeof FIELD_TYPES)[number]
export type ContainerType = (typeof CONTAINER_TYPES)[number]
export type AideType = (typeof AIDE_TYPES)[number]

// --- 工具函数 ---
export const isFieldNode = (node: FormNode): boolean => {
  return (FIELD_TYPES as readonly string[]).includes(node.type)
}

export const isContainerNode = (node: FormNode): boolean => {
  return (CONTAINER_TYPES as readonly string[]).includes(node.type)
}

export const isAideNode = (node: FormNode): boolean => {
  return (AIDE_TYPES as readonly string[]).includes(node.type)
}
