import {
  createInputNode,
  createTextareaNode,
  createNumberNode,
  createPasswordNode,
  createRadioNode,
  createCheckboxNode,
  createSelectNode,
  createTimeNode,
  createDateNode,
  createDatetimeNode,
  createUploadNode,
  createSwitchNode,
  createSliderNode,
  createRateNode,
  createCascaderNode,
  createDatepickerNode,
  createDaterangeNode,
  createColorpickerNode,
  createTreeselectNode,
  createRowNode,
  createCardNode,
  createTabsNode,
  createCollapseNode,
  createInlineNode,
  createTableNode,
  createBoxNode,
  createSpaceNode,
  createDescriptionsNode,
  createDividerNode,
  createAlertNode,
  createTextNode,
  createButtonNode,
  createHtmlNode,
  createParagraphNode,
  createTagNode,
  createLinkNode,
  createTooltipNode,
  createWatermarkNode,
  createGroupNode,
  defaultComponentRule
} from './data'
import { ComponentGroup, FormNode, isContainerNode } from './types'

// ============================================================
// 字段组件类型列表（供外部共享：字段管理页、搜索下拉等）
// ============================================================
export const componentTypes: { value: string; name: string }[] = [
  { value: 'input', name: '单行文本' },
  { value: 'textarea', name: '多行文本' },
  { value: 'number', name: '数字输入' },
  { value: 'password', name: '密码输入' },
  { value: 'radio', name: '单项选择' },
  { value: 'checkbox', name: '多项选择' },
  { value: 'select', name: '下拉选择' },
  { value: 'switch', name: '开关' },
  { value: 'slider', name: '滑块' },
  { value: 'rate', name: '评分' },
  { value: 'cascader', name: '级联选择' },
  { value: 'datepicker', name: '日期/时间' },
  { value: 'daterange', name: '范围选择' },
  { value: 'colorpicker', name: '颜色选择' },
  { value: 'treeselect', name: '树选择' },
  { value: 'time', name: '时间选择' },
  { value: 'date', name: '日期选择' },
  { value: 'datetime', name: '日期时间' },
  { value: 'upload', name: '文件上传' },
  { value: 'row', name: '栅格布局' },
  { value: 'table', name: '表格布局' },
  { value: 'inline', name: '行内布局' },
  { value: 'box', name: '盒子布局' },
  { value: 'tabs', name: '标签页' },
  { value: 'space', name: '间距' },
  { value: 'card', name: '卡片' },
  { value: 'collapse', name: '折叠面板' },
  { value: 'descriptions', name: '描述列表' },
  { value: 'group', name: '子表单' },
  { value: 'divider', name: '分割线' },
  { value: 'alert', name: '提示信息' },
  { value: 'text', name: '静态文本' },
  { value: 'button', name: '按钮' },
  { value: 'html', name: '自定义HTML' },
  { value: 'paragraph', name: '段落' },
  { value: 'tag', name: '标签' },
  { value: 'link', name: '链接' },
  { value: 'tooltip', name: '提示气泡' },
  { value: 'watermark', name: '水印' }
]

// ============================================================
// 组件分组列表（新结构，用于左侧面板）
// ============================================================
export const componentGroups: ComponentGroup[] = [
  {
    title: '基础组件',
    items: [
      { type: 'input', name: '单行文本', creater: createInputNode },
      { type: 'textarea', name: '多行文本', creater: createTextareaNode },
      { type: 'number', name: '数字输入', creater: createNumberNode },
      { type: 'password', name: '密码输入', creater: createPasswordNode },
      { type: 'radio', name: '单项选择', creater: createRadioNode },
      { type: 'checkbox', name: '多项选择', creater: createCheckboxNode },
      { type: 'select', name: '下拉选择', creater: createSelectNode },
      { type: 'switch', name: '开关', creater: createSwitchNode },
      { type: 'slider', name: '滑块', creater: createSliderNode },
      { type: 'rate', name: '评分', creater: createRateNode },
      { type: 'cascader', name: '级联选择', creater: createCascaderNode },
      { type: 'datepicker', name: '日期/时间', creater: createDatepickerNode },
      { type: 'daterange', name: '范围选择', creater: createDaterangeNode },
      { type: 'colorpicker', name: '颜色选择', creater: createColorpickerNode },
      { type: 'treeselect', name: '树选择', creater: createTreeselectNode },
      { type: 'upload', name: '文件上传', creater: createUploadNode }
    ]
  },
  {
    title: '布局组件',
    items: [
      { type: 'row', name: '栅格布局', creater: createRowNode },
      { type: 'table', name: '表格布局', creater: createTableNode },
      { type: 'inline', name: '行内布局', creater: createInlineNode },
      { type: 'box', name: '盒子布局', creater: createBoxNode },
      { type: 'tabs', name: '标签页', creater: createTabsNode },
      { type: 'space', name: '间距', creater: createSpaceNode },
      { type: 'card', name: '卡片', creater: createCardNode },
      { type: 'collapse', name: '折叠面板', creater: createCollapseNode },
      { type: 'descriptions', name: '描述列表', creater: createDescriptionsNode },
      { type: 'group', name: '子表单', creater: createGroupNode },
      { type: 'watermark', name: '水印', creater: createWatermarkNode }
    ]
  },
  {
    title: '辅助组件',
    items: [
      { type: 'divider', name: '分割线', creater: createDividerNode },
      { type: 'alert', name: '提示信息', creater: createAlertNode },
      { type: 'text', name: '静态文本', creater: createTextNode },
      { type: 'button', name: '按钮', creater: createButtonNode },
      { type: 'html', name: '自定义HTML', creater: createHtmlNode },
      { type: 'paragraph', name: '段落', creater: createParagraphNode },
      { type: 'tag', name: '标签', creater: createTagNode },
      { type: 'link', name: '链接', creater: createLinkNode },
      { type: 'tooltip', name: '提示气泡', creater: createTooltipNode }
    ]
  }
]

// ============================================================
// FormNode 树操作工具
// ============================================================

/** 在树中查找节点 */
export const findNodeById = (nodes: FormNode[], id: string): FormNode | undefined => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return undefined
}

/** 在树中删除节点 */
export const removeNodeById = (nodes: FormNode[], id: string): boolean => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      nodes.splice(i, 1)
      return true
    }
    if (nodes[i].children) {
      if (removeNodeById(nodes[i].children!, id)) return true
    }
  }
  return false
}

/** 收集所有字段节点（扁平化，用于联动字段下拉） */
export const collectFieldNodes = (nodes: FormNode[]): FormNode[] => {
  const result: FormNode[] = []
  for (const node of nodes) {
    if (node.field) result.push(node)
    // group 的 children 是模板，不递归收集
    if (node.children && node.type !== 'group') {
      result.push(...collectFieldNodes(node.children))
    }
  }
  return result
}

/** 深拷贝节点并重新生成所有 id/field */
export const cloneNode = (node: FormNode): FormNode => {
  const clone: FormNode = JSON.parse(JSON.stringify(node))
  const reId = (n: FormNode) => {
    n.id = Math.random().toString(36).substring(2, 10)
    if (n.field) n.field = Math.random().toString(36).substring(2, 10)
    if (n.children) n.children.forEach(reId)
  }
  reId(clone)
  return clone
}

/** 在树中查找节点的父数组及索引（用于同级插入） */
export const findParentAndIndex = (
  nodes: FormNode[],
  id: string
): { parent: FormNode[]; index: number } | undefined => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      return { parent: nodes, index: i }
    }
    if (nodes[i].children) {
      const found = findParentAndIndex(nodes[i].children!, id)
      if (found) return found
    }
  }
  return undefined
}
