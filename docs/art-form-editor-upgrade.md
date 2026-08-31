# ArtFormEditor 基础能力升级方案

## 一、能力对比（form-create-pro vs ArtFormEditor）

### 基础架构层

| 能力 | form-create-pro | ArtFormEditor 现状 | 差距 |
|------|----------------|-------------------|------|
| 数据结构 | Rule 树（支持嵌套 children） | Component 扁平数组 | ❌ 不支持嵌套 |
| 容器组件 | row/col/tabs/card/collapse/dialog | 无 | ❌ 缺失 |
| 布局系统 | 24 格栅格 + flex + table | 单列 | ❌ 缺失 |
| 拖拽排序 | 完整拖拽（跨容器） | 按钮上移/下移 | ❌ 体验差 |
| 字段联动 | 15 种条件 + 3 种效果（显隐/禁用/必填） | 有数据结构无 UI | ⚠️ 不完整 |
| 远程数据源 | fetch effect + 变量插值 + parse | 无 | ❌ 缺失 |
| 阅读模式 | 全组件支持 readonly/preview | 无 | ❌ 缺失 |
| 校验规则 | 多规则组合 + 自定义 validator | 单规则正则 | ⚠️ 基本够用 |
| 表单级配置 | labelPosition/labelWidth/size/inline | 无（写死样式） | ❌ 缺失 |

### 核心差距结论

**我们的 Component 是扁平数组，不支持嵌套 children，这是布局/容器能力缺失的根本原因。**

要支持容器/布局，必须将数据结构从「扁平列表」升级为「树形结构」。

---

## 二、数据结构升级

### 2.1 现有结构

```typescript
interface Component {
  show: boolean
  type: string          // 'input' | 'textarea' | ...
  config: ComponentConfig
  field: string
  relation?: ComponentRelation
}

// 使用方式：Component[]（扁平数组）
```

### 2.2 升级后的结构

```typescript
// 组件节点（统一表单字段和容器）
interface FormNode {
  id: string                    // 唯一标识（UUID）
  type: string                  // 组件/容器类型
  field?: string                // 字段标识（容器无 field）
  label?: string                // 字段标签（容器可选标题）
  props: Record<string, any>    // 组件属性（传递给实际渲染组件）
  config: NodeConfig            // 设计时配置
  children?: FormNode[]         // 子节点（容器类型才有）
  relation?: NodeRelation       // 联动条件
}

// 设计时配置
interface NodeConfig {
  // 通用
  required?: boolean
  hidden?: boolean              // 初始隐藏
  description?: string          // 帮助文本

  // 校验
  rule?: ComponentRule

  // 选项类（radio/checkbox/select）
  options?: OptionItem[]
  optionSource?: 'static' | 'remote'
  remoteConfig?: RemoteConfig

  // 布局（容器类型）
  span?: number                 // 栅格宽度 1-24
  gutter?: number               // 子元素间距
  direction?: 'horizontal' | 'vertical'  // flex 方向
  justify?: string              // flex justify
  align?: string                // flex align
}

// 选项
interface OptionItem {
  label: string
  value: string
}

// 远程数据配置
interface RemoteConfig {
  url: string
  method?: 'GET' | 'POST'
  labelField?: string           // 默认 'label'
  valueField?: string           // 默认 'value'
  dataPath?: string             // 响应中数据路径，如 'data.list'
}

// 联动条件
interface NodeRelation {
  field: string                 // 触发字段 ID
  condition: 'eq' | 'neq' | 'in' | 'notIn' | 'empty' | 'notEmpty' | 'gt' | 'lt'
  value?: any                   // 条件值
  effect: 'show' | 'hide' | 'disabled' | 'required'  // 联动效果
}

// 校验规则（保持不变）
interface ComponentRule {
  label: string
  value: string
  message?: string
  pattern?: string
}
```

### 2.3 组件类型分类

```typescript
// 字段组件（有 field，产生表单数据）
type FieldType =
  | 'input' | 'textarea' | 'password' | 'number'
  | 'radio' | 'checkbox' | 'select'
  | 'switch' | 'slider' | 'rate' | 'cascader'
  | 'time' | 'date' | 'datetime'
  | 'upload'

// 容器组件（有 children，不产生表单数据）
type ContainerType =
  | 'row'        // 栅格行（children 为 col）
  | 'col'        // 栅格列（span 控制宽度）
  | 'card'       // 卡片分组
  | 'tabs'       // 标签页
  | 'collapse'   // 折叠面板
  | 'divider'    // 分割线（无 children，纯展示）
  | 'inline'     // 行内布局（子元素水平排列）

// 辅助组件（无 field 无 children，纯展示）
type AideType =
  | 'divider'    // 分割线
  | 'alert'      // 提示信息
  | 'text'       // 静态文本
```

---

## 三、设计器架构升级

### 3.1 三栏结构保持不变

```
┌─────────────┬──────────────────────┬─────────────┐
│  组件面板    │     画布区域          │  配置面板    │
│  (左侧)     │     (中间)           │  (右侧)     │
│             │                      │             │
│ ■ 基础组件  │  ┌────────────────┐  │ 组件类型    │
│   单行文本  │  │ [栅格行]        │  │ 字段标签    │
│   多行文本  │  │  ┌──┐  ┌──┐    │  │ 字段标识    │
│   数字输入  │  │  │  │  │  │    │  │ ...         │
│   ...       │  │  └──┘  └──┘    │  │             │
│             │  │                  │  │ ── 校验 ── │
│ ■ 布局组件  │  │ [输入框]        │  │ 必填        │
│   栅格布局  │  │                  │  │ 规则类型    │
│   卡片      │  │ [单选框]        │  │             │
│   标签页    │  │                  │  │ ── 联动 ── │
│   折叠面板  │  └────────────────┘  │ 触发字段    │
│             │                      │ 条件        │
│ ■ 辅助组件  │                      │ 效果        │
│   分割线    │                      │             │
│   提示信息  │                      │             │
└─────────────┴──────────────────────┴─────────────┘
```

### 3.2 画布区升级

**核心变化：** 从扁平列表变为树形渲染，容器组件内部可接收拖入的子组件。

```vue
<!-- FormCanvas.vue（递归渲染） -->
<draggable v-model="nodes" item-key="id" group="form-nodes">
  <template #item="{ element }">
    <!-- 字段组件 -->
    <FieldNode v-if="isField(element)" :node="element" />
    
    <!-- 容器组件（递归） -->
    <ContainerNode v-else :node="element">
      <FormCanvas :nodes="element.children" />
    </ContainerNode>
  </template>
</draggable>
```

### 3.3 配置面板升级

根据选中节点的类型，动态展示不同配置区：

| 节点类型 | 配置区域 |
|---------|---------|
| 字段组件 | 基础信息 + 组件属性 + 校验规则 + 联动 + 状态 |
| row 容器 | 栅格间距(gutter) + 对齐方式 |
| col 容器 | 列宽(span) |
| card 容器 | 标题 + 是否可折叠 |
| tabs 容器 | 标签页列表（名称 + 增删） |
| collapse | 面板列表（名称 + 默认展开） |

---

## 四、布局组件详细设计

### 4.1 栅格布局（row + col）

基于 Element Plus 的 24 格栅格系统。

**设计时行为：**
- 拖入「栅格布局」→ 自动创建 1 row + 2 col（各 span=12）
- col 内可拖入字段组件或嵌套容器
- 右侧面板可调整 col 的 span、增删 col

**数据结构示例：**
```json
{
  "id": "row_001",
  "type": "row",
  "props": { "gutter": 20 },
  "config": {},
  "children": [
    {
      "id": "col_001",
      "type": "col",
      "props": { "span": 12 },
      "config": {},
      "children": [
        { "id": "field_001", "type": "input", "field": "name", ... }
      ]
    },
    {
      "id": "col_002",
      "type": "col",
      "props": { "span": 12 },
      "config": {},
      "children": [
        { "id": "field_002", "type": "input", "field": "phone", ... }
      ]
    }
  ]
}
```

**运行时渲染：**
```vue
<el-row :gutter="node.props.gutter">
  <el-col v-for="col in node.children" :span="col.props.span">
    <FormRenderer :nodes="col.children" />
  </el-col>
</el-row>
```

### 4.2 卡片分组（card）

**用途：** 将相关字段用卡片视觉分组。

**设计时行为：**
- 拖入「卡片」→ 创建带标题的容器区域
- 内部可拖入任意字段/容器

**数据结构：**
```json
{
  "id": "card_001",
  "type": "card",
  "label": "基本信息",
  "props": { "shadow": "hover" },
  "config": {},
  "children": [...]
}
```

**运行时：**
```vue
<el-card :header="node.label" :shadow="node.props.shadow">
  <FormRenderer :nodes="node.children" />
</el-card>
```

### 4.3 标签页（tabs）

**用途：** 多步骤或多分类表单。

**设计时行为：**
- 拖入「标签页」→ 创建 2 个默认 tab
- 右侧面板可增删 tab、修改 tab 名称
- 每个 tab 内部独立接收拖入组件

**数据结构：**
```json
{
  "id": "tabs_001",
  "type": "tabs",
  "props": { "type": "card" },
  "config": {},
  "children": [
    { "id": "tab_001", "type": "tab-pane", "label": "基础信息", "children": [...] },
    { "id": "tab_002", "type": "tab-pane", "label": "扩展信息", "children": [...] }
  ]
}
```

### 4.4 折叠面板（collapse）

**数据结构：**
```json
{
  "id": "collapse_001",
  "type": "collapse",
  "props": { "accordion": false },
  "config": {},
  "children": [
    { "id": "panel_001", "type": "collapse-item", "label": "详细信息", "children": [...] }
  ]
}
```

### 4.5 行内布局（inline）

**用途：** 将多个字段放在同一行（不用栅格的简化方案）。

**数据结构：**
```json
{
  "id": "inline_001",
  "type": "inline",
  "props": { "gap": 16 },
  "config": {},
  "children": [
    { "id": "field_001", "type": "input", ... },
    { "id": "field_002", "type": "input", ... }
  ]
}
```

**运行时：**
```vue
<div style="display: flex; gap: 16px;">
  <FormRenderer :nodes="node.children" />
</div>
```

---

## 五、字段联动详细设计

### 5.1 联动条件

```typescript
interface NodeRelation {
  field: string       // 触发字段的 id
  condition: 'eq' | 'neq' | 'in' | 'notIn' | 'empty' | 'notEmpty' | 'gt' | 'lt'
  value?: any         // 条件值（empty/notEmpty 时忽略）
  effect: 'show' | 'hide' | 'disabled' | 'required'
}
```

### 5.2 设计时 UI

在配置面板底部增加「联动条件」区：

```
── 字段联动 ──────────────
触发字段: [下拉：列出所有字段节点]
条件:     [等于 / 不等于 / 包含 / 为空 / 不为空 / 大于 / 小于]
条件值:   [输入框]（empty/notEmpty 时隐藏）
联动效果: [显示 / 隐藏 / 禁用 / 必填]
```

### 5.3 运行时执行

```typescript
const evaluateRelation = (relation: NodeRelation, formData: Record<string, any>): boolean => {
  const val = formData[relation.field]
  switch (relation.condition) {
    case 'eq': return val === relation.value
    case 'neq': return val !== relation.value
    case 'in': return Array.isArray(relation.value) && relation.value.includes(val)
    case 'notIn': return Array.isArray(relation.value) && !relation.value.includes(val)
    case 'empty': return val === '' || val === null || val === undefined
    case 'notEmpty': return val !== '' && val !== null && val !== undefined
    case 'gt': return Number(val) > Number(relation.value)
    case 'lt': return Number(val) < Number(relation.value)
    default: return true
  }
}
```

---

## 六、远程数据源详细设计

### 6.1 配置结构

```typescript
interface RemoteConfig {
  url: string                // API 地址
  method?: 'GET' | 'POST'   // 默认 GET
  labelField?: string        // 默认 'label'
  valueField?: string        // 默认 'value'
  dataPath?: string          // 响应数据路径，如 'data.list'
}
```

### 6.2 设计时 UI（tool.vue 选项区）

```
── 选项 ──────────────────
数据来源: (•) 静态  ( ) 远程

--- 静态模式 ---
选项1: [输入框] [×]
选项2: [输入框] [×]
[+ 添加新选项]

--- 远程模式 ---
接口地址: [https://api.example.com/options]
请求方式: [GET ▾]
数据路径: [data.list] (提示：响应 JSON 中数组的路径)
Label 字段: [label]
Value 字段: [value]
```

### 6.3 运行时加载

```typescript
const loadRemoteOptions = async (config: RemoteConfig): Promise<OptionItem[]> => {
  const res = await request({ url: config.url, method: config.method || 'GET' })
  let data = res
  if (config.dataPath) {
    data = config.dataPath.split('.').reduce((obj, key) => obj?.[key], res)
  }
  if (!Array.isArray(data)) return []
  return data.map(item => ({
    label: item[config.labelField || 'label'],
    value: item[config.valueField || 'value']
  }))
}
```

---

## 七、阅读模式

### 7.1 设计

运行时渲染器接收一个 `readonly` prop：

```vue
<FormRenderer :schema="formSchema" :data="formData" :readonly="true" />
```

### 7.2 各组件的阅读态

| 组件类型 | 阅读态渲染 |
|---------|-----------|
| input/textarea/password | 纯文本 `<span>` |
| number | 数值文本 |
| radio/select | 显示选中项的 label |
| checkbox | 显示所有选中项的 label（逗号分隔） |
| switch | 显示"是/否" |
| date/time/datetime | 格式化后的文本 |
| upload | 图片缩略图 / 文件名链接 |
| rate | 星星（不可交互） |
| slider | 数值文本 |

---

## 八、表单级配置

### 8.1 表单全局配置

```typescript
interface FormSchema {
  config: FormConfig           // 表单级配置
  nodes: FormNode[]            // 组件树
}

interface FormConfig {
  labelPosition: 'left' | 'right' | 'top'  // 默认 right
  labelWidth: string | number               // 默认 auto
  size: 'large' | 'default' | 'small'      // 默认 default
  gutter: number                            // 默认 20
  disabled: boolean                         // 全局禁用
}
```

### 8.2 设计时入口

点击画布空白区域（未选中任何组件时），右侧面板展示「表单配置」：

```
── 表单配置 ──────────────
标签位置: [右对齐 ▾] (left/right/top)
标签宽度: [auto] (px)
组件尺寸: [默认 ▾] (large/default/small)
栅格间距: [20] (px)
```

---

## 九、拖拽排序

### 9.1 依赖

```bash
pnpm add vuedraggable@^4.1.0
```

### 9.2 核心实现

使用 `vuedraggable` 的 `group` 特性实现跨容器拖拽：

```vue
<draggable
  v-model="nodes"
  :group="{ name: 'form-nodes', pull: true, put: true }"
  item-key="id"
  handle=".drag-handle"
  ghost-class="ghost"
  :animation="200"
>
  <template #item="{ element }">
    <FormNodeRenderer :node="element" @select="selectNode" />
  </template>
</draggable>
```

容器组件内部也使用同名 group，实现字段可从外部拖入容器、也可从容器拖出。

---

## 十、实施计划

### Phase 1：数据结构 + 树形渲染（基础）

| 步骤 | 内容 | 文件 |
|------|------|------|
| 1 | 定义 FormNode / FormSchema / FormConfig 类型 | `lib/types.ts` |
| 2 | 重写组件工厂函数（返回 FormNode） | `lib/data.ts` |
| 3 | 添加容器组件工厂（row/col/card/tabs/collapse/inline） | `lib/data.ts` |
| 4 | 重写 componentTypes，增加容器和辅助类型 | `lib/editor.ts` |
| 5 | 左侧组件面板分三组（基础/布局/辅助） | `components/components.vue` |

### Phase 2：画布区拖拽 + 树形渲染

| 步骤 | 内容 | 文件 |
|------|------|------|
| 6 | 安装 vuedraggable | `package.json` |
| 7 | 重写画布组件为递归树形渲染 | `components/form.vue` → 拆为 `FormCanvas.vue` + `FormNodeRenderer.vue` |
| 8 | 容器组件内部支持拖入 | `FormNodeRenderer.vue` |
| 9 | 选中状态 + 操作按钮 | 沿用现有逻辑 |

### Phase 3：配置面板适配

| 步骤 | 内容 | 文件 |
|------|------|------|
| 10 | 重写 tool.vue 适配 FormNode | `components/tool.vue` |
| 11 | 容器类型配置区（span/gutter/tabs管理等） | `components/tool.vue` |
| 12 | 联动条件配置 UI | `components/tool.vue` |
| 13 | 远程数据源配置 UI | `components/tool.vue` |
| 14 | 表单级配置（选中空白区域） | `components/tool.vue` |

### Phase 4：运行时渲染器

| 步骤 | 内容 | 文件 |
|------|------|------|
| 15 | FormRenderer 组件（递归渲染 FormNode 树） | 新建 `components/renderer/` |
| 16 | 联动逻辑执行 | renderer 内 |
| 17 | 远程选项加载 | renderer 内 |
| 18 | 阅读模式 | renderer 内 |
| 19 | 表单级配置应用 | renderer 内 |

### Phase 5：兼容性 + 迁移

| 步骤 | 内容 | 文件 |
|------|------|------|
| 20 | 旧 Component[] → FormNode[] 迁移函数 | `lib/migrate.ts` |
| 21 | router/utils/field.ts 适配新结构 | `router/utils/field.ts` |
| 22 | views/manager/field 适配 | `views/manager/field/index.vue` |
| 23 | views/manager/app/field 适配 | `views/manager/app/field/index.vue` |
| 24 | single 模式兼容 | `index.vue` |

---

## 十一、不做的事（本期边界）

| 能力 | 原因 |
|------|------|
| 公式计算引擎 | 复杂度高，当前场景不需要 |
| 事件钩子/回调 | 需要代码编辑器+沙箱执行，过重 |
| 变量系统 | 需要全局状态管理，与当前架构不匹配 |
| 导出 SFC | 我们是 JSON 驱动，不需要 |
| 子表单嵌套 | 数据结构过于复杂，用户场景不多 |
| 图表/地图组件 | 超出表单范围 |
| 自定义 validator 函数 | 安全风险（需要 eval），用正则替代 |
| 多语言 | 仅中文 |

---

## 十二、验收标准

1. ✅ 画布区可拖拽排序，支持跨容器拖拽
2. ✅ 栅格布局（row/col）可用，col 可调 span
3. ✅ 卡片/标签页/折叠面板容器可用
4. ✅ 字段联动可配置，运行时生效（显隐/禁用/必填）
5. ✅ 选项组件支持远程数据源
6. ✅ 阅读模式可用
7. ✅ 表单级配置（标签位置/宽度/尺寸）可用
8. ✅ 旧数据兼容（Component[] 自动迁移为 FormNode[]）
9. ✅ single 模式不受影响
10. ✅ TypeScript 编译通过
