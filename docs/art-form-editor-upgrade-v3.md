# ArtFormEditor 三期升级方案

> 基于 form-create v3/pro 竞品全量对比 + 本地源码能力审计后梳理
> 日期：2026-08-15

---

## 一、现状总结

### 1.1 已完成能力（v2 升级后）

| 能力 | 状态 | 说明 |
|------|------|------|
| 树形 FormNode 数据结构 | ✅ | 统一 API，无旧兼容层 |
| 15 种字段组件 | ✅ | input/textarea/number/password/radio/checkbox/select/switch/slider/rate/cascader/time/date/datetime/upload |
| 13 种容器组件 | ✅ | row/col/card/tabs/tab-pane/collapse/collapse-item/inline/table/table-col/box/space/descriptions |
| 3 种辅助组件 | ✅ | divider/alert/text |
| 多条件联动（13 种条件 × 5 种效果） | ✅ | AND/OR 组合逻辑 |
| 计算属性（安全表达式引擎） | ✅ | `{{field}}` 模板 + 白名单校验 |
| 校验规则运行时生效 | ✅ | 8 种内置规则 + 自定义正则 |
| 远程数据源 | ✅ | 静态/远程切换，GET/POST，dataPath 映射 |
| 跨容器拖拽 | ✅ | vue-draggable-plus |
| Undo/Redo | ✅ | 50 步历史 + 快捷键 |
| 阅读模式 | ✅ | readonly 分支渲染 |
| 表单级配置 | ✅ | labelPosition/labelWidth/size/gutter/disabled |
| 容器子项管理 UI | ✅ | 紧凑 child-item 布局 + 表头说明 |
| 设计器 JSON 导入/导出/预览 | ✅ | form-designer.vue |
| 快捷键 | ✅ | Ctrl+Z/Y/Shift+Z, Delete |

### 1.2 当前已发现的局限

| # | 局限 | 影响 |
|---|------|------|
| L1 | 无子表单（重复段） | 无法处理"多个联系人"等动态重复表单 |
| L2 | 无表单分步 (Steps) | 复杂表单无法分步填写 |
| L3 | 无前缀/后缀 | 输入框不能加 ¥、@xxx.com 等辅助内容 |
| L4 | 无自定义组件扩展 | 业务方无法注册自己的组件 |
| L5 | 远程数据无依赖字段刷新 | 级联下拉只能用静态 |
| L6 | FormRenderer API 薄弱 | 只有 validate/resetFields/formData |
| L7 | Upload 组件无实际上传逻辑 | action="" 未接入后端 |
| L8 | 容器不支持联动显隐 | 联动仅对字段节点生效 |
| L9 | 无节点自定义样式/类名 | 无法针对单个组件设样式 |
| L10 | 面板不支持拖拽排序 | 选项列表只能增删不能排序 |
| L11 | 不支持 drag from 面板 | 组件只能点击追加，不能拖到指定位置 |

---

## 二、与 form-create v3/pro 核心差距

### 2.1 能力对比矩阵

| 能力维度 | form-create v3/pro | ArtFormEditor 现状 | 差距级别 |
|---------|-------------------|-------------------|---------|
| **子表单/重复段** | group 组件，动态增删，min/max 限制，card/list/table 布局 | 无 | 🔴 重大 |
| **表单分步** | 步骤条组件，分步验证 | 无 | 🔴 重大 |
| **前缀/后缀** | prefix/suffix 支持文本和子组件 | 无 | 🟡 中等 |
| **远程数据增强** | fetch effect + headers + 依赖字段刷新 + 错误处理 | 仅 mount 时一次加载 | 🟡 中等 |
| **表单 API** | 60+ 方法（setValue/hidden/disabled/append/remove...） | 仅 validate + resetFields + formData | 🟡 中等 |
| **容器联动** | control 支持任意组件显隐 | 仅字段节点支持联动 | 🟡 中等 |
| **自定义组件扩展** | register 注册任意 Vue 组件 | 无扩展口 | 🟡 中等 |
| **选项拖拽排序** | 内置 sortable | 只能增删不能排序 | 🟡 中等 |
| **公式引擎** | 52+ 内置公式函数 | 仅四则运算 + Math + 三元 | 🟢 低优 |
| **事件系统** | 11 种全局事件 + 组件事件绑定 | 无 | 🟢 低优 |
| **多 UI 框架** | 8 种 UI 框架适配 | 仅 Element Plus | 🟢 不做 |
| **多语言** | 中/英/日切换 | 仅中文 | 🟢 不做 |
| **AI 生成** | 自然语言生成表单 | 无 | 🟢 后续独立项目 |
| **自定义节点样式** | class/style 任意配置 | 无 | 🟢 低优 |

---

## 三、升级方案设计

### 3.1 总体原则

1. **渐进增强** — 在 v2 稳定基础上叠加，不重构底层结构
2. **高价值优先** — 先做子表单、分步、远程增强等业务高频需求
3. **设计时/运行时分离** — 新功能先保证运行时可用，设计器 UI 可后补
4. **安全边界明确** — 不引入 eval/Function 之外的执行机制，不做事件沙箱

### 3.2 分期规划概览

```
Phase 1（子表单 + 表单分步）          ─── 5-7 天
Phase 2（远程增强 + 前缀后缀）        ─── 3-5 天
Phase 3（FormRenderer API 补全 + 容器联动） ─── 3-5 天
Phase 4（设计器体验增强）             ─── 3-5 天
Phase 5（自定义组件扩展机制）          ─── 5-7 天（可选）
```

---

## 四、Phase 1：子表单 + 表单分步（5-7 天）

### 4.1 子表单（Group 组件）

#### 4.1.1 用途

允许用户动态增删一组重复的表单字段。典型场景：
- 多个联系人（姓名 + 电话 + 关系）
- 多条地址（省/市/区/详细地址）
- 订单行项目（商品 + 数量 + 单价）

#### 4.1.2 数据结构 — `lib/types.ts`

```typescript
// FIELD_TYPES 增加 'group'
export const FIELD_TYPES = [...existingTypes, 'group'] as const

// NodeConfig 扩展
interface NodeConfig {
  // ...existing fields
  // group 组件专用
  groupMin?: number           // 最少条目数，默认 0
  groupMax?: number           // 最大条目数，默认 Infinity
  groupLayout?: 'list' | 'card'  // 展示样式
  groupDefaultValue?: Record<string, any>  // 新增条目的默认值
}
```

**group 节点约定：**
- `type: 'group'`
- `field`: 绑定字段名，formData 中为数组 `[{...}, {...}]`
- `children`: 模板字段节点（定义每一行的结构）
- `label`: 组标题

#### 4.1.3 工厂函数 — `lib/data.ts`

```typescript
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
  children: [
    createInputNode(),  // 默认给一个 input 作为模板
  ]
})
```

#### 4.1.4 运行时渲染 — 新建 `renderer/GroupRenderer.vue`

```vue
<template>
  <div class="group-renderer">
    <div class="group-renderer__title">{{ node.label }}</div>
    <div
      v-for="(item, index) in items"
      :key="index"
      class="group-renderer__item"
      :class="{ 'group-renderer__item--card': node.config.groupLayout === 'card' }"
    >
      <div class="group-renderer__item-header">
        <span class="group-renderer__item-index">{{ index + 1 }}</span>
        <el-button
          v-if="!readonly && items.length > (node.config.groupMin || 0)"
          :icon="Delete" type="danger" text size="small"
          @click="removeItem(index)"
        />
      </div>
      <RenderNodes :nodes="node.children!" :formData="item" :schema="schema" :readonly="readonly" />
    </div>
    <el-button
      v-if="!readonly && items.length < (node.config.groupMax || Infinity)"
      type="primary" text :icon="Plus"
      @click="addItem"
    >
      添加{{ node.label || '条目' }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
// items = formData[node.field] (数组)
// addItem: push 一个新对象（基于 children 的默认值 or groupDefaultValue）
// removeItem: splice(index, 1)
</script>
```

#### 4.1.5 设计时渲染 — `FormNodeRenderer.vue`

group 在设计时显示为带边框的卡片区域，内部是其 children 的 draggable 区域（复用现有容器渲染逻辑）。限制：group 内不允许再拖入 group（防止无限嵌套）。

#### 4.1.6 属性面板 — `tool.vue`

```
── 子表单配置 ──────────────────────────────
展示样式:  [卡片 ▾]
最少条目:  [0     ]
最多条目:  [10    ]
```

---

### 4.2 表单分步（Steps 组件）

#### 4.2.1 用途

将复杂表单拆为多步，每步独立验证，提升用户体验。典型场景：
- 注册流程（基础信息 → 详细信息 → 确认）
- 申请表单（个人信息 → 资质材料 → 提交）

#### 4.2.2 数据结构

```typescript
// 容器类型增加 'steps' 和 'step'
export const CONTAINER_TYPES = [...existingTypes, 'steps', 'step'] as const

// steps 节点
interface FormNode {
  // type: 'steps'
  // children: FormNode[] 每个 child 为 step 节点
  // config 扩展:
}

interface NodeConfig {
  // steps 专用
  stepsDirection?: 'horizontal' | 'vertical'
  finishStatus?: 'success' | 'wait' | 'process' | 'error' | 'finish'
  // step 专用
  stepIcon?: string
  stepDescription?: string
}
```

#### 4.2.3 工厂函数

```typescript
export const createStepsNode = (): FormNode => ({
  id: uuid(),
  type: 'steps',
  label: '分步表单',
  config: {
    stepsDirection: 'horizontal',
  },
  children: [
    { id: uuid(), type: 'step', label: '步骤一', config: {}, children: [] },
    { id: uuid(), type: 'step', label: '步骤二', config: {}, children: [] },
    { id: uuid(), type: 'step', label: '步骤三', config: {}, children: [] },
  ]
})
```

#### 4.2.4 运行时渲染 — `ContainerRenderer.vue` 新增

```vue
<!-- steps -->
<template v-if="node.type === 'steps'">
  <div class="steps-renderer">
    <el-steps :active="currentStep" :direction="node.config.stepsDirection" finish-status="success">
      <el-step v-for="(step, idx) in node.children" :key="step.id" :title="step.label" :description="step.config.stepDescription" />
    </el-steps>
    <div class="steps-renderer__content">
      <RenderNodes
        v-for="(step, idx) in node.children" :key="step.id"
        v-show="idx === currentStep"
        :nodes="step.children!" :formData="formData" :schema="schema" :readonly="readonly"
      />
    </div>
    <div class="steps-renderer__actions">
      <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
      <el-button v-if="currentStep < node.children!.length - 1" type="primary" @click="handleNext">下一步</el-button>
    </div>
  </div>
</template>
```

`handleNext` 需先验证当前步骤内的字段，验证通过才进入下一步。

#### 4.2.5 设计时行为

- 左侧面板「布局组件」增加「分步表单」
- 设计时渲染为 tabs 样式（每步一个 tab），方便编辑各步内容
- 右侧面板管理步骤列表（类似 tabs 的子项管理 UI）

---

### 4.3 Phase 1 文件变更汇总

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `lib/types.ts` | 修改 | FIELD_TYPES 增加 group；CONTAINER_TYPES 增加 steps/step；NodeConfig 增加 group/steps 配置 |
| `lib/data.ts` | 修改 | 新增 createGroupNode, createStepsNode |
| `lib/editor.ts` | 修改 | componentGroups 增加 group 和 steps |
| `components/renderer/GroupRenderer.vue` | **新建** | 子表单运行时渲染 |
| `components/renderer/ContainerRenderer.vue` | 修改 | 新增 steps 渲染分支 |
| `components/renderer/RenderNodes.vue` | 修改 | 增加 group 路由分支 |
| `components/FormNodeRenderer.vue` | 修改 | group/steps 设计时渲染 |
| `components/tool.vue` | 修改 | group/steps 配置面板 |

---

## 五、Phase 2：远程增强 + 前缀后缀（3-5 天）

### 5.1 远程数据增强

#### 5.1.1 数据结构扩展 — `RemoteConfig`

```typescript
interface RemoteConfig {
  url: string
  method?: 'GET' | 'POST'
  labelField?: string       // 默认 'label'
  valueField?: string       // 默认 'value'
  dataPath?: string         // 如 'data.list'
  // ====== 新增 ======
  headers?: Record<string, string>     // 请求头（Token 等）
  dependsOn?: string[]                 // 依赖字段（值变化时重新请求）
  params?: Record<string, string>      // URL 参数模板 {{field}}
  debounce?: number                    // 防抖 ms，默认 300
  onError?: 'silent' | 'toast'         // 错误处理
  autoLoad?: boolean                   // 是否自动加载，默认 true
}
```

#### 5.1.2 运行时改造 — `FieldRenderer.vue`

```typescript
// 依赖字段变化时重新加载
if (remoteConfig.dependsOn?.length) {
  watch(
    () => remoteConfig.dependsOn!.map(f => props.formData[f]),
    useDebounceFn(() => loadRemoteOptions(), remoteConfig.debounce || 300),
    { deep: true }
  )
}

// URL 参数模板替换
const buildUrl = (url: string, formData: Record<string, any>): string => {
  return url.replace(/\{\{(\w+)\}\}/g, (_, field) => {
    return encodeURIComponent(formData[field] ?? '')
  })
}

// 请求头支持
const fetchOptions = (url: string) => {
  return fetch(url, {
    method: remoteConfig.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...remoteConfig.headers }
  })
}
```

#### 5.1.3 设计器 UI — `tool.vue`

远程配置区扩展：

```
── 远程选项 ──────────────────────────────
接口地址:   [https://api.xxx.com/options?parentId={{parentField}}]
请求方式:   [GET ▾]
数据路径:   [data.list]
Label 字段: [name]
Value 字段: [id]
依赖字段:   [parentField ▾] (值变化时重新加载)
防抖时间:   [300] ms
请求头:     [+ 添加请求头]
```

---

### 5.2 输入框前缀/后缀

#### 5.2.1 数据结构 — `NodeConfig`

```typescript
interface NodeConfig {
  // ...existing
  prefix?: string    // 前缀文本（如 ¥、https://）
  suffix?: string    // 后缀文本（如 元、kg、@gmail.com）
  prefixIcon?: string   // 前缀图标（Element Plus icon 名）
  suffixIcon?: string   // 后缀图标
}
```

#### 5.2.2 运行时渲染 — `FieldRenderer.vue`

```vue
<el-input v-model="..." :prefix-icon="node.config.prefixIcon" :suffix-icon="node.config.suffixIcon">
  <template v-if="node.config.prefix" #prepend>{{ node.config.prefix }}</template>
  <template v-if="node.config.suffix" #append>{{ node.config.suffix }}</template>
</el-input>
```

#### 5.2.3 设计器 UI — `tool.vue`

仅对 input/number/password 类型显示：

```
── 前后缀 ──────────────────────────────
前缀文本:  [¥        ]
后缀文本:  [元       ]
```

---

### 5.3 Phase 2 文件变更汇总

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `lib/types.ts` | 修改 | RemoteConfig 增加 headers/dependsOn/params/debounce；NodeConfig 增加 prefix/suffix |
| `components/renderer/FieldRenderer.vue` | 修改 | 远程依赖刷新逻辑；前缀后缀渲染 |
| `components/tool.vue` | 修改 | 远程配置区增强；前缀后缀配置区 |

---

## 六、Phase 3：FormRenderer API 补全 + 容器联动（3-5 天）

### 6.1 FormRenderer API 补全

```typescript
// FormRenderer.vue defineExpose 扩展
defineExpose({
  // ========= 现有 =========
  validate,
  resetFields,
  formData,

  // ========= 新增 =========
  // 数据操作
  getValue: (field: string) => formData[field],
  setValue: (field: string, value: any) => { formData[field] = value },
  getFormData: () => ({ ...formData }),
  setFormData: (data: Record<string, any>) => { Object.assign(formData, data) },
  
  // 状态控制
  setDisabled: (field: string, disabled: boolean) => void,
  setHidden: (field: string, hidden: boolean) => void,
  setRequired: (field: string, required: boolean) => void,
  
  // 字段信息
  getFields: () => string[],
  getNode: (field: string) => FormNode | undefined,
  
  // 验证
  validateField: (field: string) => Promise<boolean>,
  clearValidate: (fields?: string[]) => void,
  
  // 子表单
  getGroupData: (field: string) => any[],
  addGroupItem: (field: string, data?: Record<string, any>) => void,
  removeGroupItem: (field: string, index: number) => void,
})
```

### 6.2 容器联动支持

当前联动仅对字段节点生效。扩展为容器节点也支持 `relations`：

**改造点：** `RenderNodes.vue`

```typescript
// 现有：仅过滤 field 节点
const visibleNodes = computed(() => {
  return props.nodes.filter((node) => {
    // 对所有节点（包括容器）执行联动判断
    if (node.relations?.length) {
      return evaluateRelations(node, props.formData).visible
    }
    return !node.config.hidden
  })
})
```

**改造点：** `tool.vue`

容器节点的属性面板也显示「字段联动」配置区（现有逻辑仅在 `isFieldNodeType` 时展示）。

---

### 6.3 Phase 3 文件变更汇总

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `components/renderer/FormRenderer.vue` | 修改 | defineExpose 扩展 15+ 方法 |
| `components/renderer/RenderNodes.vue` | 修改 | 容器节点也参与联动过滤 |
| `components/tool.vue` | 修改 | 容器节点显示联动配置区 |

---

## 七、Phase 4：设计器体验增强（3-5 天）

### 7.1 组件面板搜索

左侧组件列表增加搜索框，按名称过滤：

```vue
<el-input v-model="searchText" placeholder="搜索组件" size="small" clearable :prefix-icon="Search" />
```

### 7.2 选项拖拽排序

tool.vue 中的静态选项列表、tabs/collapse/table 子项列表支持拖拽排序：

```vue
<VueDraggable v-model="currentNode.config.options" handle=".drag-handle" animation="150">
  <div v-for="(opt, idx) in currentNode.config.options" :key="idx" class="option">
    <el-icon class="drag-handle"><Rank /></el-icon>
    <!-- ...existing option content -->
  </div>
</VueDraggable>
```

### 7.3 从面板拖入设计区

目前组件只能点击追加到末尾。改为：
- 左侧组件面板的组件项可拖拽
- 拖到设计区任意位置（容器内/容器间）直接插入

实现：左侧面板 item 作为 draggable source，设计区各 draggable 区域作为 target，共享 group name。

### 7.4 节点自定义类名

```typescript
interface NodeConfig {
  // ...existing
  customClass?: string    // 自定义 CSS 类名
  customStyle?: string    // 自定义内联样式
}
```

设计器属性面板增加「高级」折叠区：

```
── 高级 ──────────────────────────────
自定义类名:  [my-special-input  ]
自定义样式:  [margin-top: 10px  ]
```

### 7.5 Ctrl+C / Ctrl+V 复制粘贴

```typescript
// 快捷键扩展
if (isMeta && e.key === 'c') {
  e.preventDefault()
  editorRef.value?.copyActive?.()
}
if (isMeta && e.key === 'v') {
  e.preventDefault()
  editorRef.value?.pasteNode?.()
}
if (isMeta && e.key === 'd') {
  e.preventDefault()
  editorRef.value?.duplicateActive?.()
}
```

---

### 7.6 Phase 4 文件变更汇总

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `components/components.vue` | 修改 | 增加搜索框；组件项改为 draggable source |
| `components/tool.vue` | 修改 | 选项拖拽排序；高级配置区（类名/样式） |
| `components/form.vue` | 修改 | 接收面板拖入；copyActive/pasteNode/duplicateActive |
| `components/FormNodeRenderer.vue` | 修改 | 渲染时应用 customClass/customStyle |
| `components/renderer/FieldRenderer.vue` | 修改 | 运行时应用 customClass/customStyle |
| `index.vue` | 修改 | 快捷键扩展 Ctrl+C/V/D |

---

## 八、Phase 5：自定义组件扩展机制（5-7 天，可选）

### 8.1 设计目标

允许业务方注册自己的 Vue 组件到设计器中使用，无需修改 ArtFormEditor 源码。

### 8.2 注册接口

```typescript
// lib/extension.ts
interface CustomComponentDef {
  type: string                // 唯一类型标识，如 'biz-address-picker'
  name: string                // 显示名称
  icon?: string               // 图标
  group?: 'basic' | 'layout' | 'aide' | 'business'  // 分组
  // 设计时
  defaultConfig: () => NodeConfig
  defaultProps?: () => Record<string, any>
  // 运行时
  component: Component        // Vue 组件（接收 modelValue + props）
  // 属性面板
  configPanel?: Component     // 可选的自定义配置面板组件
}

// 注册 API
export const registerComponent = (def: CustomComponentDef): void
export const getRegisteredComponents = (): CustomComponentDef[]
```

### 8.3 使用方式

```typescript
import { registerComponent } from '@/components/core/base/art-form-editor'
import BizAddressPicker from './BizAddressPicker.vue'

registerComponent({
  type: 'biz-address-picker',
  name: '地址选择器',
  icon: 'Location',
  group: 'business',
  defaultConfig: () => ({ required: false, hidden: false }),
  component: BizAddressPicker,
})
```

注册后自动出现在左侧面板的「业务组件」分组中，拖入设计区后用 `component` 字段渲染。

### 8.4 运行时渲染 — `FieldRenderer.vue`

```vue
<!-- 自定义组件 fallback -->
<template v-else>
  <component
    :is="getCustomComponent(node.type)"
    v-model="formData[node.field!]"
    v-bind="node.props"
    :disabled="computedDisabled"
    :readonly="readonly"
  />
</template>
```

---

### 8.5 Phase 5 文件变更汇总

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `lib/extension.ts` | **新建** | 注册机制 + 组件存储 |
| `lib/editor.ts` | 修改 | componentGroups 动态合并自定义组件 |
| `components/components.vue` | 修改 | 渲染自定义组件分组 |
| `components/renderer/FieldRenderer.vue` | 修改 | 自定义组件渲染 fallback |
| `components/FormNodeRenderer.vue` | 修改 | 设计时渲染自定义组件占位 |
| `components/tool.vue` | 修改 | 支持自定义 configPanel |
| `index.ts` | **新建** | 统一导出 registerComponent API |

---

## 九、实施节奏与验收

### 9.1 时间线

| Phase | 内容 | 预计工时 | 验收标准 |
|-------|------|---------|---------|
| 1 | 子表单 + 表单分步 | 5-7 天 | group 可增删行且数据正确收集；steps 可分步填写 + 分步验证 |
| 2 | 远程增强 + 前缀后缀 | 3-5 天 | 远程选项支持依赖刷新；前后缀正确渲染 |
| 3 | API 补全 + 容器联动 | 3-5 天 | FormRenderer 15+ API 可用；容器可配置联动 |
| 4 | 设计器体验增强 | 3-5 天 | 搜索/排序/拖入/复制粘贴 可用 |
| 5 | 自定义组件扩展（可选） | 5-7 天 | registerComponent 注册后在设计器和渲染器均可用 |

### 9.2 各期不做的边界

| 不做 | 原因 |
|------|------|
| 公式引擎（SUM/IF/CONCAT 等 50+ 函数） | 表达式模板 `{{a}} * {{b}}` + Math 已覆盖 80% 场景 |
| 事件沙箱 | 安全风险高，用联动 + 计算属性替代 |
| 多 UI 框架适配 | 项目仅使用 Element Plus |
| 多语言 | 仅服务中文场景 |
| AI 生成表单 | 独立项目 |
| Effect 插件系统 | v2 文档中的 Phase 5，用自定义组件扩展替代，更直观 |

---

## 十、技术风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 子表单嵌套深度 | 无限递归 | 限制 group 内不能再拖入 group（最多 1 层） |
| Steps 分步验证 | 需拿到当前步骤内所有字段 | 根据 step.children 收集字段列表，调用 validateField |
| 远程依赖刷新高频触发 | 请求风暴 | debounce + 取消未完成请求（AbortController） |
| 自定义组件接口不统一 | 渲染异常 | 强约定 v-model 接口 + props 透传 |
| 面板拖入改造工作量 | 与现有 draggable 逻辑冲突 | 使用 vue-draggable-plus 的 clone 模式 |
| FormRenderer API 中 setDisabled/setHidden | 需反向修改 node 数据 | 通过 provide 注入 override map，renderer 优先读 override |

---

## 十一、测试策略

| 层级 | 覆盖范围 | 工具 |
|------|---------|------|
| 单元测试 | relation.ts、computed.ts、新 API 方法 | Vitest |
| 组件测试 | GroupRenderer、Steps、FieldRenderer 前缀后缀 | @vue/test-utils + Vitest |
| E2E 测试 | 子表单增删、分步切换验证、远程依赖刷新 | Playwright |

---

## 十二、总结

本方案在 v2 已建立的稳定基础上，聚焦**业务高频缺失能力**，分 5 期交付：

| 优先级 | 功能 | 业务价值 |
|--------|------|---------|
| 🔴 P0 | 子表单 | 动态重复段是表单系统的必备能力 |
| 🔴 P0 | 表单分步 | 复杂表单体验提升明显 |
| 🟡 P1 | 远程依赖刷新 | 省市区级联等场景刚需 |
| 🟡 P1 | 前缀后缀 | 小功能大体验 |
| 🟡 P1 | API 补全 | 业务集成必须 |
| 🟡 P1 | 容器联动 | 补齐联动盲区 |
| 🟢 P2 | 设计器体验 | 效率提升 |
| 🟢 P2 | 自定义组件 | 生态扩展能力 |

核心设计原则：
1. **渐进叠加** — 不重构底层，在 FormNode 树上自然扩展
2. **运行时优先** — 先保证渲染器功能完整，设计器 UI 可后补
3. **安全不妥协** — 不引入新的 eval/动态执行机制
4. **实用主义** — 不追求覆盖 form-create 100% 功能，只做项目实际需要的
