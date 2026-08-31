# ArtFormEditor 二期优化方案

> 基于 form-create v3/pro 全量对比，结合本地源码全量扫描后梳理

## 一、现状总结

### 1.1 已完成的基础能力

| 能力 | 实现文件 | 状态 |
|------|---------|------|
| 树形 FormNode 数据结构 | `lib/types.ts` | ✅ 完整 |
| 23 种组件（11 字段 + 9 容器 + 3 辅助） | `lib/data.ts` + `lib/editor.ts` | ✅ 完整 |
| 跨容器拖拽（vue-draggable-plus） | `form.vue` + `FormNodeRenderer.vue` | ✅ 完整 |
| 单条件联动（8 种条件 × 4 种效果） | `lib/relation.ts` + renderer | ✅ 完整 |
| 远程数据源（静态/远程切换） | `tool.vue` + `FieldRenderer.vue` | ✅ 基本完整 |
| 阅读模式 | `FieldRenderer.vue` readonly 分支 | ✅ 完整 |
| 表单级配置 | `FormRenderer.vue` + `FormConfig` | ✅ 完整 |
| Undo/Redo | `lib/useHistory.ts` | ✅ 完整 |
| 旧数据双向迁移 | `lib/migrate.ts` | ✅ 完整 |

### 1.2 已发现的 Bug（需先修复）

| # | Bug | 位置 | 修复方案 |
|---|-----|------|---------|
| B1 | `uuid()` 的 `replace('-', '')` 只替换第一个 `-` | `data.ts:L~5` + `migrate.ts` | 改为 `.replaceAll('-', '')` 或 `/g` 正则 |
| B2 | Card 容器不转发 `@copy` 事件 | `FormNodeRenderer.vue:L~160` | 补上 `@copy="emit('copy', $event)"` |
| B3 | 复制嵌套节点时插入位置错误 | `form.vue` handleCopy | 用 `findParentAndIndex` 替代顶层 findIndex |
| B4 | `config.rule` 定义了但 renderer 未生成 el-form 校验规则 | `FieldRenderer.vue` | 接入 Element Plus `:rules` |
| B5 | switch/slider/rate/cascader 在类型定义中但无 creater 且 renderer fallback 为 input | `data.ts` + `FieldRenderer.vue` | 补充工厂函数和渲染分支 |
| B6 | 重复的 `uuid()` 定义 | `data.ts` + `migrate.ts` | 提取到 `lib/utils.ts` |

---

## 二、与 form-create v3/pro 核心差距

### 2.1 能力对比矩阵

| 能力维度 | form-create v3/pro | ArtFormEditor 现状 | 差距级别 |
|---------|-------------------|-------------------|---------|
| **多条件联动** | control 数组，14 种条件，AND/OR 组合，动态插入字段 | 单条件单效果 | 🔴 重大 |
| **计算属性** | computed 字段动态计算 value/props/disabled | 无 | 🔴 重大 |
| **校验规则** | validate 数组，多规则组合，异步校验，自定义 validator | 单规则正则，renderer 未接入 | 🟡 中等 |
| **Effect 扩展** | 注册 effect 插件，完整生命周期，零侵入扩展 | 所有逻辑硬编码 | 🟡 中等 |
| **表单 API** | fApi 30+ 方法（append/remove/setValue/hidden/disabled...） | 仅 validate + resetFields | 🟡 中等 |
| **JSON 编辑/预览** | 设计器内 JSON 面板 + 实时预览 + 导入导出 | 无 | 🟡 中等 |
| **子表单/分组** | group 组件，动态增删重复区块，嵌套 API | 无 | 🟡 中等 |
| **远程数据增强** | fetch effect + 请求头 + 依赖字段刷新 + 错误处理 | 仅 mount 时一次加载 | 🟡 中等 |
| **事件系统** | on 事件 + emit 监听 + inject 注入 | 无 | 🟢 低优 |
| **公式函数** | 90+ 内置函数（SUM/IF/CONCAT...） | 无 | 🟢 低优 |
| **多语言** | i18n 一键切换 | 无（仅中文） | 🟢 不做 |
| **AI 生成** | AI 描述生成表单 | 无 | 🟢 后续考虑 |

---

## 三、升级方案设计

### 3.1 总体原则

1. **破坏性升级**：旧字段（如 `relation`）通过 migrate.ts 一次性转换，不做运行时兼容
2. **数据迁移**：migrate.ts 确保旧数据升级后格式统一，不保留废弃字段
3. **设计时/运行时分离**：设计器能力和 renderer 能力独立迭代
4. **不过度设计**：不做公式引擎、事件沙箱、多语言等重型系统

### 3.2 分期规划概览

```
Phase 1（Bug 修复 + 校验补全）    ─── 2-3 天
Phase 2（多条件联动 + 计算属性）   ─── 5-7 天
Phase 3（子表单 + 远程增强）       ─── 3-5 天
Phase 4（设计器体验 + API 补全）   ─── 3-5 天
Phase 5（Effect 扩展机制）         ─── 5-7 天（可选）
```

---

## 四、Phase 1：Bug 修复 + 校验补全（2-3 天）

### 4.1 修复已知 Bug（B1-B6）

详见上表。均为定点修复，无架构变更。

### 4.2 校验规则接入 Element Plus

**现状问题：** `node.config.rule` 有数据、设计器可配、但 FieldRenderer 从未将其转换为 Element Plus 的 `:rules` prop。

**改造点：** `FieldRenderer.vue`

```typescript
// 新增：将 ComponentRule 转为 el-form-item rules
const computedRules = computed(() => {
  const rules: any[] = []

  // required
  if (computedRequired.value) {
    rules.push({ required: true, message: `${node.label}不能为空`, trigger: 'blur' })
  }

  // config.rule 映射
  const rule = props.node.config.rule
  if (rule) {
    const ruleMap: Record<string, string> = {
      phone: '^1[3-9]\\d{9}$',
      email: '^[\\w.-]+@[\\w.-]+\\.\\w+$',
      idcard: '^\\d{17}[\\dXx]$',
      url: '^https?://',
      chinese: '^[\\u4e00-\\u9fa5]+$',
      number: '^\\d+(\\.\\d+)?$',
      alphanum: '^[a-zA-Z0-9]+$',
    }
    const pattern = rule.value === 'regex' ? rule.pattern : ruleMap[rule.value]
    if (pattern) {
      rules.push({
        pattern: new RegExp(pattern),
        message: rule.message || `${node.label}格式不正确`,
        trigger: 'blur'
      })
    }
  }

  // minLength / maxLength
  if (props.node.config.minLength) {
    rules.push({ min: props.node.config.minLength, message: `最少${props.node.config.minLength}个字符`, trigger: 'blur' })
  }
  if (props.node.config.maxLength) {
    rules.push({ max: props.node.config.maxLength, message: `最多${props.node.config.maxLength}个字符`, trigger: 'blur' })
  }

  return rules
})
```

模板变更：
```vue
<el-form-item :label="node.label" :prop="node.field" :rules="computedRules">
```

### 4.3 补全缺失组件

为 `switch`、`slider`、`rate`、`cascader` 补充：
- `data.ts` 中的 creater 工厂函数
- `editor.ts` 的 componentGroups 中添加条目
- `FieldRenderer.vue` 中增加渲染分支
- `tool.vue` 中增加对应配置区

---

## 五、Phase 2：多条件联动 + 计算属性（5-7 天）

### 5.1 多条件联动

#### 5.1.1 数据结构升级 — `lib/types.ts`

**变更内容：** FormNode 的 `relation` 字段**删除**，替换为 `relations` 数组 + `relationLogic`；NodeRelation 扩展条件和效果

```typescript
// ========== NodeRelation（全新） ==========
interface NodeRelation {
  field: string                   // 触发字段标识
  condition:
    | 'eq' | 'neq' | 'in' | 'notIn' | 'empty' | 'notEmpty'
    | 'gt' | 'lt' | 'gte' | 'lte'
    | 'contains' | 'between' | 'pattern'
  value?: any                     // 条件值（empty/notEmpty 忽略；between 为 [min, max]）
  effect: 'show' | 'hide' | 'disabled' | 'required' | 'value'
  effectValue?: any               // effect='value' 时赋的值
}

// ========== FormNode 变更 ==========
interface FormNode {
  id: string
  type: string
  field?: string
  label?: string
  props?: Record<string, any>
  config: NodeConfig
  children?: FormNode[]
  relations?: NodeRelation[]      // 联动条件数组（替代旧 relation）
  relationLogic?: 'and' | 'or'   // 多条件组合逻辑，默认 'and'
}
```

> ⚠️ 不保留旧的 `relation` 单条件字段。旧数据需通过 `migrate.ts` 一次性转换为 `relations: [oldRelation]`。

**各字段何时使用：**

| 字段 | 何时使用 | 使用示例 |
|------|---------|---------|
| `relations` | 用户配置了 1 条或多条联动规则 | 单条件：`[{field:'sex', condition:'eq', value:'male', effect:'show'}]`；多条件：组合多个 |
| `relationLogic` | `relations.length >= 2` 时，设计器展示切换器 | `'and'`：全部满足；`'or'`：任一满足 |
| `condition: 'gte'` | 数值大于等于判断 | 「当积分 ≥ 1000 时显示兑换按钮」 |
| `condition: 'lte'` | 数值小于等于判断 | 「当库存 ≤ 0 时禁用购买按钮」 |
| `condition: 'contains'` | 字符串包含匹配 | 「当地址包含"海外"时必填护照号」 |
| `condition: 'between'` | 区间判断，`value` 为 `[min, max]` | 「年龄 18-60 时显示保险选项」 |
| `condition: 'pattern'` | 正则匹配，`value` 为正则字符串 | 「输入匹配手机号格式时显示验证码字段」 |
| `effect: 'value'` | 条件满足时自动赋值 | 「类型=VIP → 折扣=0.8」，配合 `effectValue: 0.8` |

---

#### 5.1.2 求值引擎 — `lib/relation.ts`

**变更内容：** 
1. `evaluateRelation()` 支持全部 13 种条件
2. 新增 `evaluateRelations()` 顶层函数，直接操作 `node.relations`

```typescript
export const evaluateRelation = (relation: NodeRelation, formData: Record<string, any>): boolean => {
  const val = formData[relation.field]
  switch (relation.condition) {
    case 'eq': return val === relation.value
    case 'neq': return val !== relation.value
    case 'in': return Array.isArray(relation.value) && relation.value.includes(val)
    case 'notIn': return Array.isArray(relation.value) && !relation.value.includes(val)
    case 'empty': return val === '' || val === null || val === undefined || (Array.isArray(val) && val.length === 0)
    case 'notEmpty': return val !== '' && val !== null && val !== undefined && !(Array.isArray(val) && val.length === 0)
    case 'gt': return Number(val) > Number(relation.value)
    case 'lt': return Number(val) < Number(relation.value)
    case 'gte': return Number(val) >= Number(relation.value)
    case 'lte': return Number(val) <= Number(relation.value)
    case 'contains': return typeof val === 'string' && val.includes(String(relation.value))
    case 'between':
      return Array.isArray(relation.value) && Number(val) >= Number(relation.value[0]) && Number(val) <= Number(relation.value[1])
    case 'pattern':
      try { return new RegExp(String(relation.value)).test(String(val ?? '')) }
      catch { return false }
    default: return true
  }
}

export interface RelationResult {
  visible: boolean
  disabled: boolean
  required: boolean
  value?: any         // effect='value' 时的赋值
}

export const evaluateRelations = (node: FormNode, formData: Record<string, any>): RelationResult => {
  const relations = node.relations || []

  if (!relations.length) {
    return { visible: !node.config.hidden, disabled: false, required: !!node.config.required }
  }

  const logic = node.relationLogic || 'and'
  const matched: Record<string, boolean> = { show: false, hide: false, disabled: false, required: false }
  let assignValue: any = undefined
  let anyMet = false

  for (const rel of relations) {
    const met = evaluateRelation(rel, formData)
    if (logic === 'and' && !met) {
      return { visible: !node.config.hidden, disabled: false, required: !!node.config.required }
    }
    if (met) {
      anyMet = true
      if (rel.effect === 'value') assignValue = rel.effectValue
      else matched[rel.effect] = true
    }
  }

  const triggered = logic === 'and' ? true : anyMet
  if (!triggered) {
    return { visible: !node.config.hidden, disabled: false, required: !!node.config.required }
  }

  return {
    visible: matched.hide ? false : (matched.show ? true : !node.config.hidden),
    disabled: matched.disabled,
    required: matched.required || !!node.config.required,
    value: assignValue
  }
}
```

**调用关系：**

| 调用方 | 使用场景 | 消费字段 |
|--------|---------|---------|
| `RenderNodes.vue` visibleNodes | formData 变化时过滤可见节点 | `.visible` |
| `FieldRenderer.vue` computedDisabled | formData 变化时判断禁用 | `.disabled` |
| `FieldRenderer.vue` computedRequired | formData 变化时判断必填 | `.required` |
| `FieldRenderer.vue` value watch | 联动赋值条件满足时写入 formData | `.value` |

---

#### 5.1.3 运行时 RenderNodes.vue 改造

```typescript
import { evaluateRelations } from '../../lib/relation'

const visibleNodes = computed(() => {
  return props.nodes.filter((node) => evaluateRelations(node, props.formData).visible)
})
```

**触发时机：** `props.formData` 任意字段值变化 → Vue 响应式自动重算。

---

#### 5.1.4 运行时 FieldRenderer.vue 改造

```typescript
import { evaluateRelations } from '../../lib/relation'
import { evaluateExpression, extractDependencies } from '../../lib/computed'

const relationResult = computed(() => evaluateRelations(props.node, props.formData))
const computedDisabled = computed(() => relationResult.value.disabled)
const computedRequired = computed(() => relationResult.value.required)

// 联动赋值
watch(
  () => relationResult.value.value,
  (newVal) => {
    if (newVal !== undefined && props.formData[props.node.field!] !== newVal) {
      props.formData[props.node.field!] = newVal
    }
  }
)
```

**触发时机：**
- `computedDisabled/Required`：formData 变化 → 组件 `:disabled` / `:required` / `:rules` 响应
- value watch：`effect: 'value'` 条件满足时自动赋值

---

#### 5.1.5 设计器 tool.vue 联动区改造

**改后 UI 设计：**

```
── 字段联动 ──────────────────────────────
组合逻辑: [全部满足(AND) ▾]     ← 仅 relations.length >= 2 时显示

条件 1:
  触发字段: [姓名 ▾]  条件: [不为空 ▾]  值: [---]  效果: [显示 ▾]  [×]

条件 2:
  触发字段: [年龄 ▾]  条件: [大于等于 ▾]  值: [18]  效果: [显示 ▾]  [×]

[+ 添加条件]
```

**代码关键：**

```typescript
// 直接操作 currentNode.relations 数组
const nodeRelations = computed({
  get: () => currentNode.value?.relations || [],
  set: (val: NodeRelation[]) => {
    if (!currentNode.value) return
    currentNode.value.relations = val
  }
})

const nodeRelationLogic = computed({
  get: () => currentNode.value?.relationLogic || 'and',
  set: (val: 'and' | 'or') => {
    if (!currentNode.value) return
    currentNode.value.relationLogic = val
  }
})

const addRelation = () => {
  nodeRelations.value = [...nodeRelations.value, { field: '', condition: 'eq', value: '', effect: 'show' }]
}

const removeRelation = (index: number) => {
  const list = [...nodeRelations.value]
  list.splice(index, 1)
  nodeRelations.value = list
}
```

**条件下拉选项（13 种）：**

| 值 | 显示名 | 附加 UI |
|---|--------|--------|
| `eq` | 等于 | 输入框 |
| `neq` | 不等于 | 输入框 |
| `in` | 包含值 | 输入框 |
| `notIn` | 不包含值 | 输入框 |
| `empty` | 为空 | 无 |
| `notEmpty` | 不为空 | 无 |
| `gt` | 大于 | 输入框 |
| `lt` | 小于 | 输入框 |
| `gte` | 大于等于 | 输入框 |
| `lte` | 小于等于 | 输入框 |
| `contains` | 包含文本 | 输入框 |
| `between` | 在区间内 | 双输入框 |
| `pattern` | 正则匹配 | 输入框 |

**效果下拉选项（5 种）：**

| 值 | 显示名 | 附加 UI |
|---|--------|--------|
| `show` | 显示 | 无 |
| `hide` | 隐藏 | 无 |
| `disabled` | 禁用 | 无 |
| `required` | 必填 | 无 |
| `value` | 赋值 | 展示「目标值」输入框 |

---

#### 5.1.6 数据迁移 — `lib/migrate.ts`

旧数据中 `relation` 单条件字段需一次性转换：

```typescript
// migrateComponents 或 schema 加载时
if (node.relation && !node.relations) {
  node.relations = [node.relation]
  delete node.relation
}
```

---

### 5.2 计算属性

#### 5.2.1 数据结构 — `NodeConfig` 扩展

```typescript
interface ComputedConfig {
  enabled: boolean
  expression: string        // 如 "{{price}} * {{quantity}}"
  dependencies?: string[]   // 自动从 expression 提取
}

interface NodeConfig {
  // ...existing
  computed?: ComputedConfig
}
```

**适用场景：**

| 场景 | expression | 说明 |
|------|-----------|------|
| 价格计算 | `{{price}} * {{quantity}}` | 总价 = 单价 × 数量 |
| 折扣 | `{{total}} * (1 - {{discount}})` | 实付金额 |
| 条件值 | `{{score}} >= 60 ? "合格" : "不合格"` | 三元表达式 |
| 百分比 | `Math.round({{done}} / {{total}} * 100)` | 进度 |

**不适用：** 需要异步请求、访问 DOM、自定义函数调用。

---

#### 5.2.2 表达式引擎 — 新建 `lib/computed.ts`

```typescript
export const extractDependencies = (expression: string): string[] => {
  const matches = expression.matchAll(/\{\{(\w+)\}\}/g)
  return [...new Set([...matches].map(m => m[1]))]
}

const SAFE_CHARS = /^[+\-*/%()?:.<>=!&|,\s\d.]+$/

export const evaluateExpression = (expression: string, formData: Record<string, any>): any => {
  let expr = expression.replace(/\{\{(\w+)\}\}/g, (_, field) => {
    const val = formData[field]
    if (val === undefined || val === null || val === '') return '0'
    if (typeof val === 'string') return JSON.stringify(val)
    return String(val)
  })

  const stripped = expr.replace(/["'][^"']*["']/g, '').replace(/Math\.\w+/g, '')
  if (!SAFE_CHARS.test(stripped)) {
    console.warn('[FormEditor] unsafe expression blocked:', expression)
    return undefined
  }

  try {
    return new Function(`"use strict"; return (${expr})`)()
  } catch { return undefined }
}
```

---

#### 5.2.3 运行时集成 — `FieldRenderer.vue`

```typescript
if (props.node.config.computed?.enabled && props.node.config.computed.expression) {
  const deps = props.node.config.computed.dependencies
    || extractDependencies(props.node.config.computed.expression)

  watch(
    () => deps.map(d => props.formData[d]),
    () => {
      const result = evaluateExpression(props.node.config.computed!.expression, props.formData)
      if (result !== undefined) {
        props.formData[props.node.field!] = result
      }
    },
    { immediate: true }
  )
}
```

**触发时机：** `config.computed.enabled === true` 且 expression 非空时，依赖字段值变化自动计算。

**与联动赋值 effect='value' 的区别：**

| | 联动赋值 | 计算属性 |
|---|---------|---------|
| 触发 | 特定条件满足 | 依赖字段任意变化 |
| 赋值 | 固定值 effectValue | 表达式动态计算 |
| 场景 | 「类型=VIP → 折扣=0.8」 | 「总价 = 单价 × 数量」 |

---

#### 5.2.4 设计器 — `tool.vue` 计算属性配置区

```
── 计算属性 ──────────────────────────────
☑ 启用自动计算

表达式:
┌─────────────────────────────────────┐
│ {{price}} * {{quantity}}            │
└─────────────────────────────────────┘
提示：使用 {{字段标识}} 引用其他字段
支持运算：+ - * / % () ?: > < >= <= == !=
支持函数：Math.round/floor/ceil/max/min

依赖字段: [price] [quantity]  ← 自动识别
```

仅字段节点展示；勾选「启用」后才显示表达式输入。

---

### 5.3 Phase 2 文件变更汇总

| 文件 | 变更类型 | 变更内容 |
|------|---------|---------|
| `lib/types.ts` | 修改 | FormNode 删除 relation，新增 relations/relationLogic；NodeRelation 扩展 13 种条件 + value 效果；NodeConfig 新增 computed |
| `lib/relation.ts` | 修改 | evaluateRelation 支持全部条件；新增 evaluateRelations |
| `lib/computed.ts` | **新建** | evaluateExpression + extractDependencies |
| `renderer/RenderNodes.vue` | 修改 | visibleNodes 用 evaluateRelations |
| `renderer/FieldRenderer.vue` | 修改 | 联动用 evaluateRelations + value watch；新增 computed watch |
| `components/tool.vue` | 修改 | 联动区改为多条件 UI；新增计算属性配置区 |
| `lib/migrate.ts` | 修改 | 旧 relation → relations 一次性转换 |

---

## 六、Phase 3：子表单 + 远程数据增强（3-5 天）

### 6.1 子表单（group 组件）

#### 用途

允许用户动态增删一组重复的表单字段（如：多个联系人、多条地址）。

#### 数据结构

```typescript
// 新增组件类型
// FIELD_TYPES 中增加 'group'

// group 节点的特殊处理
interface FormNode {
  // type: 'group' 时:
  //   - children 定义一组模板字段
  //   - field 绑定的 formData 值为数组: [{...}, {...}, ...]
  //   - config 扩展:
}

interface NodeConfig {
  // ...existing
  // group 组件专用
  groupMin?: number      // 最少条目数（默认 0）
  groupMax?: number      // 最大条目数（默认无限）
  groupLayout?: 'list' | 'card' | 'table'  // 展示样式
}
```

#### 设计时行为

- 左侧面板「基础组件」分组中新增「子表单」
- 拖入画布后，创建一个带框的区域（类似 card），内部可拖入字段组件作为重复模板
- 右侧配置面板：最小/最大条目数、展示样式

#### 运行时渲染

```vue
<!-- GroupRenderer.vue -->
<div class="group-renderer">
  <div v-for="(item, index) in formData[node.field]" :key="index" class="group-item">
    <RenderNodes :nodes="node.children" :formData="item" :schema="schema" :readonly="readonly" />
    <el-button v-if="!readonly" @click="removeItem(index)" :icon="Delete" circle size="small" />
  </div>
  <el-button v-if="!readonly && canAdd" @click="addItem" :icon="Plus">
    添加{{ node.label || '条目' }}
  </el-button>
</div>
```

### 6.2 远程数据增强

#### 数据结构扩展

```typescript
interface RemoteConfig {
  url: string
  method?: 'GET' | 'POST'
  labelField?: string
  valueField?: string
  dataPath?: string
  // ====== 新增 ======
  headers?: Record<string, string>   // 请求头（Token 等）
  dependsOn?: string[]               // 依赖字段（值变化时重新请求）
  params?: Record<string, string>    // URL 参数模板 {{field}}
  debounce?: number                  // 防抖（ms），默认 300
  onError?: 'silent' | 'toast'       // 错误处理方式
}
```

#### 运行时改造（FieldRenderer.vue）

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
```

#### 设计器 UI 扩展（tool.vue 远程配置区）

```
── 远程选项 ──────────────────────────────
接口地址:   [https://api.xxx.com/options?parentId={{parentField}}]
请求方式:   [GET ▾]
数据路径:   [data.list]
Label 字段: [name]
Value 字段: [id]
请求头:     [Authorization: Bearer xxx  ] (可选)
依赖字段:   [parentField ▾] (值变化时重新加载)
防抖时间:   [300] ms
```

---

## 七、Phase 4：设计器体验 + API 补全（3-5 天）

### 7.1 JSON 编辑面板

在设计器中间区域顶部增加 tab 切换：「设计」|「JSON」|「预览」

```vue
<!-- 设计器顶部切换 -->
<el-radio-group v-model="viewMode" size="small">
  <el-radio-button value="design">设计</el-radio-button>
  <el-radio-button value="json">JSON</el-radio-button>
  <el-radio-button value="preview">预览</el-radio-button>
</el-radio-group>
```

- **JSON 模式**：Monaco Editor（或 CodeMirror）展示当前 Schema JSON，支持编辑后同步回 nodes
- **预览模式**：用 FormRenderer 渲染当前 Schema，可填写数据、触发校验

### 7.2 FormRenderer API 补全

```typescript
// FormRenderer.vue defineExpose 扩展
defineExpose({
  // 现有
  validate,
  resetFields,

  // 新增
  getValue: (field: string) => formData[field],
  setValue: (field: string, value: any) => { formData[field] = value },
  getFormData: () => ({ ...formData }),
  setFormData: (data: Record<string, any>) => { Object.assign(formData, data) },
  setDisabled: (field: string, disabled: boolean) => { /* 通过 provide 通知 */ },
  setHidden: (field: string, hidden: boolean) => { /* 修改节点 config.hidden */ },
  getFields: () => collectFieldNodes(props.schema.nodes).map(n => n.field!),
  clearValidate: (fields?: string[]) => formRef.value?.clearValidate(fields),
})
```

### 7.3 设计器搜索/筛选

左侧组件面板增加搜索框，按名称过滤组件列表：

```vue
<el-input v-model="searchText" placeholder="搜索组件" size="small" clearable prefix-icon="Search" />
```

### 7.4 选项拖拽排序

tool.vue 中静态选项列表和 tabs/collapse 面板列表支持拖拽排序（目前只能增删不能排序）。

### 7.5 快捷键支持

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Z` | 撤销 |
| `Ctrl+Shift+Z` | 重做 |
| `Delete` / `Backspace` | 删除选中节点 |
| `Ctrl+C` / `Ctrl+V` | 复制/粘贴节点 |
| `Ctrl+D` | 复制当前节点 |

---

## 八、Phase 5：Effect 扩展机制（5-7 天，可选）

### 8.1 设计目标

允许业务方通过注册 effect 插件扩展字段行为，无需修改 ArtFormEditor 源码。

### 8.2 Effect 接口定义

```typescript
// lib/effect.ts
interface EffectContext {
  node: FormNode
  formData: Record<string, any>
  api: FormRendererApi
  value: any  // effect 属性的当前值
}

interface FormEffect {
  name: string                              // 唯一标识
  init?: (ctx: EffectContext) => void       // 节点初始化时
  mounted?: (ctx: EffectContext) => void    // DOM 挂载后
  watch?: (ctx: EffectContext) => void      // effect 属性值变化时
  valueChange?: (ctx: EffectContext) => void // 字段值变化时
  destroy?: (ctx: EffectContext) => void    // 节点销毁时
}
```

### 8.3 注册与使用

```typescript
// 注册
import { registerEffect } from '@/components/core/base/art-form-editor'

registerEffect({
  name: 'cascadeLoad',
  mounted({ node, formData, api }) {
    // 根据父字段值加载子选项
    const parentField = node.props?.cascadeParent
    watch(() => formData[parentField], async (val) => {
      const options = await fetchChildOptions(val)
      node.config.options = options
    })
  }
})

// 使用（在 FormNode 中）
{ type: 'select', field: 'city', props: { $cascadeLoad: true, cascadeParent: 'province' } }
```

### 8.4 内置 Effect

| Effect | 功能 |
|--------|------|
| `required` | 动态必填（已有，包装为 effect） |
| `fetch` | 远程数据加载（已有，包装为 effect） |
| `computed` | 计算属性（Phase 2 实现后包装） |
| `cascadeLoad` | 级联加载 |

---

## 九、实施节奏与验收

### 9.1 时间线

| Phase | 内容 | 预计工时 | 验收标准 |
|-------|------|---------|---------|
| 1 | Bug 修复 + 校验补全 + 补充组件 | 2-3 天 | 6 个 Bug 修复；校验规则运行时生效；switch/slider/rate/cascader 可用 |
| 2 | 多条件联动 + 计算属性 | 5-7 天 | 多条件 AND/OR 配置可用；计算表达式运行时生效；migrate.ts 一次性将旧 relation 转为 relations |
| 3 | 子表单 + 远程增强 | 3-5 天 | group 组件可增删行；远程选项支持依赖字段刷新；URL 参数模板生效 |
| 4 | 设计器体验 + API 补全 | 3-5 天 | JSON/预览 tab 可用；搜索可用；FormRenderer API 补全 |
| 5 | Effect 扩展（可选） | 5-7 天 | effect 注册机制可用；内置 4 个 effect；文档 |

### 9.2 每期不做的边界

| 不做 | 原因 |
|------|------|
| 公式引擎（SUM/IF/CONCAT 函数） | 用表达式模板 `{{a}} + {{b}}` 覆盖 80% 场景即可 |
| 事件沙箱执行 | 安全风险高，用联动 + 计算属性替代 |
| 变量系统 | 过重，依赖全局状态管理 |
| 多语言 | 仅服务中文场景 |
| AI 生成表单 | 独立项目，不在本组件范围内 |
| 自定义 validator 函数 | 安全风险（需 eval），用正则 + 内置规则覆盖 |

---

## 十、文件变更清单

### Phase 1

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `lib/utils.ts` | 新建 | 提取公共 uuid() |
| `lib/data.ts` | 修改 | 修复 uuid；新增 switch/slider/rate/cascader 工厂 |
| `lib/migrate.ts` | 修改 | 修复 uuid；引用公共 utils |
| `lib/editor.ts` | 修改 | componentGroups 补充新组件 |
| `components/FormNodeRenderer.vue` | 修改 | 修复 card @copy；补充渲染分支 |
| `components/form.vue` | 修改 | 修复嵌套节点复制 |
| `components/tool.vue` | 修改 | 补充 switch/slider/rate/cascader 配置区 |
| `components/renderer/FieldRenderer.vue` | 修改 | 接入 :rules；补充渲染分支 |

### Phase 2

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `lib/types.ts` | 修改 | FormNode 增加 relations/relationLogic；NodeConfig 增加 computed |
| `lib/relation.ts` | 修改 | 新增 evaluateRelations；扩展条件类型 |
| `lib/computed.ts` | 新建 | 表达式引擎 + 依赖提取 |
| `components/tool.vue` | 修改 | 联动区改为多条件 UI；新增计算属性配置区 |
| `components/renderer/RenderNodes.vue` | 修改 | 使用 evaluateRelations 替代旧逻辑 |
| `components/renderer/FieldRenderer.vue` | 修改 | 集成计算属性 watch |
| `lib/migrate.ts` | 修改 | 单 relation → relations 一次性转换 |

### Phase 3

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `lib/types.ts` | 修改 | FIELD_TYPES 增加 group；NodeConfig 增加 group 配置 |
| `lib/data.ts` | 修改 | 新增 createGroupNode |
| `components/renderer/GroupRenderer.vue` | 新建 | 子表单运行时渲染 |
| `components/renderer/RenderNodes.vue` | 修改 | 增加 group 分支路由 |
| `components/renderer/FieldRenderer.vue` | 修改 | 远程数据依赖刷新逻辑 |
| `components/tool.vue` | 修改 | 远程配置区增加 headers/依赖/防抖 |
| `components/FormNodeRenderer.vue` | 修改 | group 设计时渲染（可拖入模板字段） |

### Phase 4

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `components/json-editor.vue` | 新建 | JSON 编辑面板 |
| `components/preview.vue` | 新建 | 预览面板 |
| `components/form.vue` | 修改 | 增加 viewMode tab 切换 |
| `components/components.vue` | 修改 | 增加搜索框 |
| `components/tool.vue` | 修改 | 选项列表支持拖拽排序 |
| `components/renderer/FormRenderer.vue` | 修改 | defineExpose 补全 API |
| `index.vue` | 修改 | 快捷键绑定 |

### Phase 5（可选）

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `lib/effect.ts` | 新建 | Effect 注册/执行引擎 |
| `lib/effects/required.ts` | 新建 | 内置 required effect |
| `lib/effects/fetch.ts` | 新建 | 内置 fetch effect |
| `lib/effects/computed.ts` | 新建 | 内置 computed effect |
| `lib/effects/cascadeLoad.ts` | 新建 | 内置级联加载 effect |
| `components/renderer/FieldRenderer.vue` | 修改 | 接入 effect 生命周期 |
| `index.ts` | 新建 | 导出 registerEffect API |

---

## 十一、技术风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 多条件联动性能（大表单多字段互相依赖） | 高频 computed 触发、渲染卡顿 | 用 watchEffect + shallowRef 减少响应层级；联动求值结果缓存 |
| 表达式引擎安全性 | XSS / 代码注入 | 严格白名单校验（只允许数字和运算符）；拒绝字符串拼接以外的操作 |
| 旧数据迁移 | 升级后旧 Schema 字段缺失无法渲染 | migrate.ts 一次性转换 relation→relations；上线前跑全量数据验证脚本 |
| 子表单嵌套深度 | 无限递归风险 | 限制嵌套层数（最多 2 层）；设计器禁止 group 内再拖 group |
| FormNodeRenderer.vue 文件过大 | 维护困难 | Phase 4 拆分为独立的 FieldNodeRenderer / ContainerNodeRenderer / AideNodeRenderer |

---

## 十二、测试策略

| 层级 | 覆盖范围 | 工具 |
|------|---------|------|
| 单元测试 | relation.ts、computed.ts、migrate.ts | Vitest |
| 组件测试 | FieldRenderer、FormRenderer、GroupRenderer | @vue/test-utils + Vitest |
| E2E 测试 | 设计器拖拽、联动配置、预览验证 | Playwright |
| 数据迁移测试 | 旧 Component[] / relation 迁移后完整性 | Jest snapshot |

---

## 十三、总结

本方案围绕「多条件联动」和「计算属性」两大核心能力展开，辅以校验补全、子表单、远程增强、设计器体验四个维度，分 5 期渐进交付。

核心设计原则：
1. **数据结构不兼容旧字段** — 旧 relation 通过 migrate.ts 一次性转为 relations[]；computed 为 NodeConfig 可选字段
2. **运行时安全** — 表达式引擎无 eval，白名单运算符
3. **设计器与 renderer 解耦** — 设计器配不配不影响 renderer 已有功能
4. **可选的扩展性** — Phase 5 的 effect 机制为未来预留口子，但不是强依赖
