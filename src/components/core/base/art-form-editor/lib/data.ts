import { ComponentRule, FormNode } from './types'
import { uuid } from './utils'

// ============================================================
// 校验规则列表
// ============================================================

export const defaultComponentRule: ComponentRule[] = [
  { label: '无', value: '' },
  { label: '手机号', value: 'phone' },
  { label: '邮箱', value: 'email' },
  { label: '身份证号', value: 'idcard' },
  { label: '网址', value: 'url' },
  { label: '纯中文', value: 'chinese' },
  { label: '纯数字', value: 'number' },
  { label: '字母数字', value: 'alphanum' },
  { label: '自定义正则', value: 'regex' }
]

// ============================================================
// FormNode 工厂函数（新结构）
// ============================================================

// --- 字段组件 ---

export const createInputNode = (): FormNode => ({
  id: uuid(),
  type: 'input',
  field: uuid(),
  label: '标题',
  config: {
    required: true,
    hidden: false,
    maxLength: 30,
    value: '',
    placeholder: '请输入'
  }
})

export const createTextareaNode = (): FormNode => ({
  id: uuid(),
  type: 'textarea',
  field: uuid(),
  label: '标题',
  config: {
    required: true,
    hidden: false,
    maxLength: 150,
    value: '',
    placeholder: '请输入'
  }
})

export const createNumberNode = (): FormNode => ({
  id: uuid(),
  type: 'number',
  field: uuid(),
  label: '标题',
  config: {
    required: true,
    hidden: false,
    value: 0,
    placeholder: '请输入',
    min: 0,
    max: 100,
    step: 1
  }
})

export const createPasswordNode = (): FormNode => ({
  id: uuid(),
  type: 'password',
  field: uuid(),
  label: '标题',
  config: {
    required: true,
    hidden: false,
    value: '',
    placeholder: '请输入',
    maxLength: 30
  }
})

export const createRadioNode = (): FormNode => ({
  id: uuid(),
  type: 'radio',
  field: uuid(),
  label: '标题',
  config: {
    required: true,
    hidden: false,
    value: undefined,
    placeholder: '请选择',
    options: [
      { label: '选择一', value: '选择一' },
      { label: '选择二', value: '选择二' }
    ],
    optionSource: 'static'
  }
})

export const createCheckboxNode = (): FormNode => ({
  id: uuid(),
  type: 'checkbox',
  field: uuid(),
  label: '标题',
  config: {
    required: true,
    hidden: false,
    value: [],
    placeholder: '请选择',
    options: [
      { label: '选择一', value: '选择一' },
      { label: '选择二', value: '选择二' }
    ],
    optionSource: 'static'
  }
})

export const createSelectNode = (): FormNode => ({
  id: uuid(),
  type: 'select',
  field: uuid(),
  label: '标题',
  config: {
    required: true,
    hidden: false,
    value: '',
    placeholder: '请选择',
    options: [
      { label: '选择一', value: '选择一' },
      { label: '选择二', value: '选择二' }
    ],
    optionSource: 'static'
  }
})

export const createTimeNode = (): FormNode => ({
  id: uuid(),
  type: 'time',
  field: uuid(),
  label: '标题',
  config: {
    required: true,
    hidden: false,
    value: '',
    placeholder: '请选择'
  }
})

export const createDateNode = (): FormNode => ({
  id: uuid(),
  type: 'date',
  field: uuid(),
  label: '标题',
  config: {
    required: true,
    hidden: false,
    value: '',
    placeholder: '请选择'
  }
})

export const createDatetimeNode = (): FormNode => ({
  id: uuid(),
  type: 'datetime',
  field: uuid(),
  label: '标题',
  config: {
    required: true,
    hidden: false,
    value: '',
    placeholder: '请选择'
  }
})

export const createUploadNode = (): FormNode => ({
  id: uuid(),
  type: 'upload',
  field: uuid(),
  label: '文件上传',
  config: {
    required: true,
    hidden: false,
    value: '',
    filetype: 'image',
    limit: 1
  }
})

export const createSwitchNode = (): FormNode => ({
  id: uuid(),
  type: 'switch',
  field: uuid(),
  label: '开关',
  config: {
    required: false,
    hidden: false,
    value: false
  }
})

export const createSliderNode = (): FormNode => ({
  id: uuid(),
  type: 'slider',
  field: uuid(),
  label: '滑块',
  config: {
    required: false,
    hidden: false,
    value: 0,
    min: 0,
    max: 100,
    step: 1
  }
})

export const createRateNode = (): FormNode => ({
  id: uuid(),
  type: 'rate',
  field: uuid(),
  label: '评分',
  config: {
    required: false,
    hidden: false,
    value: 0,
    max: 5
  }
})

export const createCascaderNode = (): FormNode => ({
  id: uuid(),
  type: 'cascader',
  field: uuid(),
  label: '级联选择',
  config: {
    required: true,
    hidden: false,
    value: [],
    placeholder: '请选择',
    options: [],
    optionSource: 'static'
  }
})

export const createDatepickerNode = (): FormNode => ({
  id: uuid(),
  type: 'datepicker',
  field: uuid(),
  label: '日期/时间',
  config: {
    required: true,
    hidden: false,
    value: '',
    placeholder: '请选择',
    dateType: 'date'
  }
})

export const createDaterangeNode = (): FormNode => ({
  id: uuid(),
  type: 'daterange',
  field: uuid(),
  label: '范围选择',
  config: {
    required: true,
    hidden: false,
    value: [],
    rangeType: 'daterange',
    rangeSeparator: '至',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期'
  }
})

export const createColorpickerNode = (): FormNode => ({
  id: uuid(),
  type: 'colorpicker',
  field: uuid(),
  label: '颜色选择',
  config: {
    required: false,
    hidden: false,
    value: '',
    showAlpha: false,
    colorFormat: 'hex'
  }
})

export const createTreeselectNode = (): FormNode => ({
  id: uuid(),
  type: 'treeselect',
  field: uuid(),
  label: '树选择',
  config: {
    required: true,
    hidden: false,
    value: undefined,
    placeholder: '请选择',
    treeMultiple: false,
    treeCheckStrictly: false,
    treeShowCheckbox: false,
    treeFilterable: true,
    treeData: [],
    optionSource: 'static'
  }
})

// --- 容器组件 ---

export const createRowNode = (): FormNode => ({
  id: uuid(),
  type: 'row',
  label: '栅格布局',
  config: { gutter: 20 },
  children: [
    {
      id: uuid(),
      type: 'col',
      config: { span: 12 },
      children: []
    },
    {
      id: uuid(),
      type: 'col',
      config: { span: 12 },
      children: []
    }
  ]
})

export const createCardNode = (): FormNode => ({
  id: uuid(),
  type: 'card',
  label: '卡片分组',
  props: { shadow: 'hover' },
  config: {},
  children: []
})

export const createTabsNode = (): FormNode => ({
  id: uuid(),
  type: 'tabs',
  label: '标签页',
  props: { type: 'card' },
  config: {},
  children: [
    {
      id: uuid(),
      type: 'tab-pane',
      label: '标签一',
      config: {},
      children: []
    },
    {
      id: uuid(),
      type: 'tab-pane',
      label: '标签二',
      config: {},
      children: []
    }
  ]
})

export const createCollapseNode = (): FormNode => ({
  id: uuid(),
  type: 'collapse',
  label: '折叠面板',
  props: { accordion: false },
  config: {},
  children: [
    {
      id: uuid(),
      type: 'collapse-item',
      label: '面板一',
      config: {},
      children: []
    }
  ]
})

export const createInlineNode = (): FormNode => ({
  id: uuid(),
  type: 'inline',
  label: '行内布局',
  config: { gutter: 16, direction: 'horizontal' },
  children: []
})

// 表格布局：多列容器，每列默认占等宽
export const createTableNode = (): FormNode => ({
  id: uuid(),
  type: 'table',
  label: '表格布局',
  config: { gutter: 0 },
  children: [
    {
      id: uuid(),
      type: 'table-col',
      label: '列1',
      config: { span: 8 },
      children: []
    },
    {
      id: uuid(),
      type: 'table-col',
      label: '列2',
      config: { span: 8 },
      children: []
    },
    {
      id: uuid(),
      type: 'table-col',
      label: '列3',
      config: { span: 8 },
      children: []
    }
  ]
})

// 盒子布局：通用 flex 容器
export const createBoxNode = (): FormNode => ({
  id: uuid(),
  type: 'box',
  label: '盒子布局',
  config: { gutter: 12, direction: 'vertical' },
  children: []
})

// 间距：纯间隔占位
export const createSpaceNode = (): FormNode => ({
  id: uuid(),
  type: 'space',
  label: '间距',
  config: { gutter: 20 }
})

// 描述列表
export const createDescriptionsNode = (): FormNode => ({
  id: uuid(),
  type: 'descriptions',
  label: '描述列表',
  props: { column: 2, border: true },
  config: {},
  children: [
    {
      id: uuid(),
      type: 'col',
      label: '名称',
      config: { span: 12 },
      children: []
    },
    {
      id: uuid(),
      type: 'col',
      label: '内容',
      config: { span: 12 },
      children: []
    }
  ]
})

// --- 辅助组件 ---

export const createDividerNode = (): FormNode => ({
  id: uuid(),
  type: 'divider',
  label: '分割线',
  config: {}
})

export const createAlertNode = (): FormNode => ({
  id: uuid(),
  type: 'alert',
  label: '提示信息',
  props: { type: 'info', closable: false },
  config: { description: '这是一条提示信息' }
})

export const createTextNode = (): FormNode => ({
  id: uuid(),
  type: 'text',
  label: '静态文本',
  config: { description: '请输入文本内容' }
})

export const createButtonNode = (): FormNode => ({
  id: uuid(),
  type: 'button',
  label: '按钮',
  config: { buttonType: 'primary', buttonSize: 'default', buttonText: '按钮', buttonPlain: false, buttonRound: false }
})

export const createHtmlNode = (): FormNode => ({
  id: uuid(),
  type: 'html',
  label: '自定义HTML',
  config: { htmlContent: '<p style="color: #666;">自定义内容</p>' }
})

export const createParagraphNode = (): FormNode => ({
  id: uuid(),
  type: 'paragraph',
  label: '段落',
  config: { paragraphContent: '请输入段落内容', paragraphAlign: 'left' }
})

export const createTagNode = (): FormNode => ({
  id: uuid(),
  type: 'tag',
  label: '标签',
  config: { tagText: '标签', tagType: 'primary', tagEffect: 'light', tagSize: 'default', tagRound: false, tagClosable: false }
})

export const createLinkNode = (): FormNode => ({
  id: uuid(),
  type: 'link',
  label: '链接',
  config: { linkText: '链接文字', linkHref: '', linkType: 'primary', linkUnderline: true, linkTarget: '_blank' }
})

export const createTooltipNode = (): FormNode => ({
  id: uuid(),
  type: 'tooltip',
  label: '提示',
  config: { tooltipContent: '提示文字', tooltipPlacement: 'top', tooltipTriggerText: '悬停查看提示' }
})

export const createWatermarkNode = (): FormNode => ({
  id: uuid(),
  type: 'watermark',
  label: '水印',
  config: { watermarkContent: '水印文字', watermarkFontSize: 16, watermarkRotate: -22, watermarkGap: [100, 100] },
  children: []
})

// --- 子表单 ---
export const createGroupNode = (): FormNode => ({
  id: uuid(),
  type: 'group',
  field: 'group_' + uuid(),
  label: '子表单',
  config: {
    required: false,
    hidden: false,
    groupMin: 0,
    groupMax: 10,
    groupLayout: 'card',
  },
  children: []
})

// ============================================================
// 默认表单配置
// ============================================================

export const defaultFormConfig = (): import('./types').FormConfig => ({
  labelPosition: 'right',
  labelWidth: 'auto',
  size: 'default',
  gutter: 20,
  disabled: false
})
